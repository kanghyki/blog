import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionAPI } from './notion/NotionAPI';
import { NotionAPIDatabaseAdapter, NotionAPIPageAdapter } from './notion/NotionAPIAdapter';
import {
  GetBlockCommand,
  GetDatabaseCommand,
  GetDatabaseQueryCommand,
  GetPageCommand,
  GetUserCommand,
} from './notion/NotionAPICommand';
import { NotionBlockFactory } from './notion/NotionBlock';

export enum BlogPostStatus {
  Published = 'Published',
}

export interface IBlogPost {
  id: string;
  title: string;
  createdAt: Date;
  content: string;
  authors: string[];
  category: string;
  icon: string;
  summary: string;
}

export class BlogPost implements IBlogPost {
  public id: string;
  public title: string;
  public createdAt: Date;
  public content: string;
  public authors: string[];
  public category: string;
  public icon: string;
  public summary: string;

  constructor(id: string) {
    this.id = id;
    this.title = '';
    this.createdAt = new Date(0);
    this.content = '';
    this.authors = [];
    this.category = '';
    this.icon = '';
    this.summary = '';
  }

  public addAuthor(author: string): void {
    this.authors.push(author);
  }

  public toInterface(): IBlogPost {
    return {
      id: this.id,
      title: this.title,
      createdAt: this.createdAt,
      content: this.content,
      authors: this.authors,
      category: this.category,
      icon: this.icon,
      summary: this.summary,
    };
  }
}

export class NullBlogPost extends BlogPost {
  constructor() {
    super('');
  }
}

export async function getCategories(api: NotionAPI): Promise<string[]> {
  const command = new GetDatabaseCommand({
    database_id: `${process.env.NOTION_DB_ID}`,
  });
  const res = await api.send(command);
  if (!res) return [];

  const adapter = new NotionAPIDatabaseAdapter(res);
  return adapter.readSelect('category');
}

export async function getDbPage(api: NotionAPI): Promise<PageObjectResponse[]> {
  const command = new GetDatabaseQueryCommand({
    params: {
      database_id: `${process.env.NOTION_DB_ID}`,
      filter: {
        property: 'Status',
        status: {
          equals: BlogPostStatus.Published,
        },
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    },
  });
  const res = await api.send(command);

  if (!res) return [];
  return res;
}

export async function getPosts(api: NotionAPI): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];
  const res = await getDbPage(api);

  for (const page of res) {
    const adapter = new NotionAPIPageAdapter(page);
    const blogPost = new BlogPost(adapter.id);

    const title = adapter.readTitle('title');
    const date = adapter.readDate('Date');
    const authorIds = adapter.readPeopleId('author');
    const category = adapter.readSelect('category');
    const summary = adapter.readText('summary');

    if (page.icon && page.icon.type === 'emoji') blogPost.icon = page.icon.emoji;
    blogPost.title = title;
    blogPost.createdAt = date;
    for (const authorId of authorIds) {
      const cmd = new GetUserCommand({ user_id: authorId });
      const user = await api.send(cmd);
      if (!user) continue;
      if (user.name) blogPost.addAuthor(user.name);
    }
    blogPost.category = category;
    blogPost.summary = summary;
    posts.push(blogPost);
  }

  return posts;
}

/**
 * @deprecated('Use n2m instead')
 */
export async function getPageContent(api: NotionAPI, id: string): Promise<string> {
  let content = '';

  const command = new GetBlockCommand({ page_id: id });
  const res = await api.send(command);
  if (!res) return '';

  const factory = new NotionBlockFactory();
  for (const node of res) {
    const block = factory.getBlock(node.block);
    await block.storeExternalStorage();
    content += block.toMarkdown();
  }

  return content;
}

export async function getPost(api: NotionAPI, id: string): Promise<BlogPost> {
  const blogPost = new BlogPost(id);

  const command = new GetPageCommand({ page_id: id });
  const res = await api.send(command);
  if (!res) return new NullBlogPost();
  const adapter = new NotionAPIPageAdapter(res);

  const title = adapter.readTitle('title');
  const date = adapter.readDate('Date');
  const authorIds = adapter.readPeopleId('author');
  const category = adapter.readSelect('category');
  const summary = adapter.readText('summary');

  if (res.icon && res.icon.type === 'emoji') blogPost.icon = res.icon.emoji;
  blogPost.title = title;
  blogPost.createdAt = date;
  for (const id of authorIds) {
    const getUserCommand = new GetUserCommand({ user_id: id });
    const user = await api.send(getUserCommand);
    if (!user) continue;
    if (user.name) blogPost.addAuthor(user.name);
  }
  blogPost.category = category;
  blogPost.summary = summary;

  return blogPost;
}
