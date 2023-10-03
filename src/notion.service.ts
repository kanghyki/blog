import 'server-only';
import {
  Client,
  LogLevel,
  isFullBlock,
  isFullDatabase,
  isFullPage,
  isFullUser,
  isNotionClientError,
  iteratePaginatedAPI,
} from '@notionhq/client';
import { NotionBlockFactory } from './notion-blocks';
import { BlogPost, BlogPostStatus, NullBlogPost } from './BlogPost';
import {
  PageObjectResponse,
  PartialUserObjectResponse,
  UserObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export class NotionAPI {
  private static instance: NotionAPI;
  private notionClient: Client;

  private constructor() {
    this.notionClient = new Client({
      auth: process.env.NOTION_SECRET_KEY,
      logLevel: LogLevel.WARN,
    });
  }

  static getInstance(): NotionAPI {
    if (NotionAPI.instance === undefined) {
      NotionAPI.instance = new NotionAPI();
    }

    return NotionAPI.instance;
  }

  public getClient(): Client {
    return this.notionClient;
  }
}

async function getUserObjects(partialUserObjects: PartialUserObjectResponse[]): Promise<UserObjectResponse[]> {
  const ret: UserObjectResponse[] = [];
  const notionAPI = NotionAPI.getInstance().getClient();

  for (const userObject of partialUserObjects) {
    try {
      const userId = userObject.id;
      const user = await notionAPI.users.retrieve({ user_id: userId });
      if (!isFullUser(user)) continue;
      ret.push(user);
    } catch (error) {
      if (isNotionClientError(error)) console.error('Notion error');
      else console.error('My error');
      console.error(error);
    }
  }

  return ret;
}

async function setBlogPostProperties(blogPost: BlogPost, page: PageObjectResponse): Promise<void> {
  if (page.properties['title'].type === 'title') {
    page.properties['title'].title.forEach(e => {
      blogPost.title += e.plain_text;
    });
  }
  if (page.properties['Date'].type === 'date' && page.properties['Date'].date)
    blogPost.createdAt = new Date(page.properties['Date'].date.start);
  if (page.properties['author'].type === 'people') {
    const userObjects = await getUserObjects(page.properties['author'].people);
    userObjects.forEach((uo: UserObjectResponse) => {
      if (uo.name) blogPost.addAuthor(uo.name);
    });
  }
  if (page.properties['tag'].type === 'multi_select') {
    const tags = page.properties['tag'].multi_select;
    for (const tag of tags) {
      if (tag.name) blogPost.addTag(tag.name);
    }
  }

  // blogPost.content = await getBlocks(notionAPI, page.id);
}

export async function getSingleBlogPost(id: string): Promise<BlogPost> {
  try {
    const notionAPI = NotionAPI.getInstance().getClient();
    const page = await notionAPI.pages.retrieve({ page_id: id });
    if (
      !isFullPage(page) ||
      page.properties['Status'].type !== 'status' ||
      page.properties['Status'].status?.name !== BlogPostStatus.SHOW
    )
      return new NullBlogPost();

    const blogPost: BlogPost = new BlogPost(id);
    await setBlogPostProperties(blogPost, page);

    return blogPost;
  } catch (error) {
    if (isNotionClientError(error)) console.error('Notion error');
    else console.error('My error');
    console.error(error);
  }

  return new NullBlogPost();
}

export async function getTags(): Promise<string[]> {
  let tags: string[] = [];
  try {
    const notionAPI = NotionAPI.getInstance().getClient();
    const database = await notionAPI.databases.retrieve({
      database_id: `${process.env.NOTION_DB_ID}`,
    });
    if (!isFullDatabase(database)) return tags;
    if (database.properties['tag'].type === 'multi_select') {
      database.properties['tag'].multi_select.options.forEach(e => {
        tags.push(e.name);
      });
    }
  } catch (error) {
    if (isNotionClientError(error)) console.error('Notion error');
    else console.error('My error');
    console.error(error);
  }

  return tags;
}

export async function getReadableBlogPosts(): Promise<BlogPost[]> {
  const blogPosts: Array<BlogPost> = Array<BlogPost>();
  try {
    const notionAPI = NotionAPI.getInstance().getClient();

    const dbPageOnlyShow = await notionAPI.databases.query({
      database_id: `${process.env.NOTION_DB_ID}`,
      filter: {
        property: 'Status',
        status: {
          equals: BlogPostStatus.SHOW,
        },
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    for (const page of dbPageOnlyShow.results) {
      if (page.object !== 'page' || !isFullPage(page)) continue;

      const blogPost = new BlogPost(page.id);
      await setBlogPostProperties(blogPost, page);

      blogPosts.push(blogPost);
    }
  } catch (error) {
    if (isNotionClientError(error)) console.error('Notion error');
    else console.error('My error');
    console.error(error);
  }

  return blogPosts;
}

export async function getBlocks(
  notionAPI: Client,
  pageId: string | undefined,
  maxDepth: number = 1,
  depth: number = 0,
): Promise<string> {
  if (pageId === undefined || depth > maxDepth) return '';
  let content: string = '';

  try {
    for await (const block of iteratePaginatedAPI(notionAPI.blocks.children.list, {
      block_id: pageId,
    })) {
      if (!isFullBlock(block)) continue;
      const converter = new NotionBlockFactory().getConverter(block);
      content += converter.toString();

      if (block.has_children) content += await getBlocks(notionAPI, block.id, maxDepth, depth + 1);
    }
  } catch (error) {
    if (isNotionClientError(error)) console.error('Notion error');
    else console.error('My error');
    console.error(error);
  }

  return content;
}
