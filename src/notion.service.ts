import { Client, LogLevel, isFullBlock, isFullPage, isNotionClientError, iteratePaginatedAPI } from '@notionhq/client';
import { NotionBlockFactory } from './notion-blocks';
import { BlogPost, BlogPostStatus } from './BlogPost';

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

      if (page.properties['title'].type === 'title') {
        page.properties['title'].title.forEach(e => {
          blogPost.title += e.plain_text;
        });
      }
      if (page.properties['Date'].type === 'date' && page.properties['Date'].date)
        blogPost.createdAt = new Date(page.properties['Date'].date.start);
      if (page.properties['author'].type === 'select' && page.properties['author'].select?.name)
        blogPost.author = page.properties['author'].select?.name;

      // blogPost.content = await getBlocks(notionAPI, page.id);

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
