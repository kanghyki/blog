import { PageObjectResponse, UserObjectResponse } from '@notionhq/client/build/src/api-endpoints';
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
  Idea = 'Idea',
  Draft = 'Draft',
  Published = 'Published',
}

export class BlogPost {
  private _id: string;
  private _title: string;
  private _createdAt: Date;
  private _content: string;
  private _authors: string[];
  private _tags: string[];

  constructor(_id: string) {
    this._id = _id;
    this._title = '';
    this._createdAt = new Date(0);
    this._content = '';
    this._authors = [];
    this._tags = [];
  }

  get id(): string {
    return this._id;
  }

  set id(_id: string) {
    this._id = _id;
  }

  get title(): string {
    return this._title;
  }

  set title(_title: string) {
    this._title = _title;
  }

  get authors(): string[] {
    return this._authors;
  }

  public addAuthor(author: string): void {
    this._authors.push(author);
  }

  get tags(): string[] {
    return this._tags;
  }

  public addTag(tag: string): void {
    this._tags.push(tag);
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  set createdAt(_createdAt: Date) {
    this._createdAt = _createdAt;
  }

  get content(): string {
    return this._content;
  }

  set content(_content: string) {
    this._content = _content;
  }
}

export class NullBlogPost extends BlogPost {
  constructor() {
    super('');
  }
}

export async function getTags(api: NotionAPI): Promise<string[]> {
  const command = new GetDatabaseCommand({
    database_id: `${process.env.NOTION_DB_ID}`,
  });
  const res = await api.send(command);
  if (res.ok) {
    const adapter = new NotionAPIDatabaseAdapter(res.res);
    return adapter.readMultiSelect('tag');
  }
  return [];
}

export async function getDbPage(api: NotionAPI): Promise<PageObjectResponse[]> {
  const dbQueryCommand = new GetDatabaseQueryCommand({
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
  const dbQueryRes = await api.send(dbQueryCommand);
  if (!dbQueryRes.ok) return [];

  return dbQueryRes.res;
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
    const tags = adapter.readMultiSelect('tag');

    blogPost.title = title;
    blogPost.createdAt = date;
    for (const authorId of authorIds) {
      const cmd = new GetUserCommand({ user_id: authorId });
      const res: UserObjectResponse = (await api.send(cmd)).res;
      if (res.name) blogPost.addAuthor(res.name);
    }
    for (const tag of tags) blogPost.addTag(tag);
    posts.push(blogPost);
  }

  return posts;
}

export async function getPageContent(api: NotionAPI, id: string): Promise<string> {
  let content = '';

  const command = new GetBlockCommand({
    page_id: id,
  });
  const res = await api.send(command);
  if (!res.ok) return '';

  const factory = new NotionBlockFactory();
  for (const node of res.res) {
    const block = factory.getBlock(node.block);
    await block.storeExternalStorage();
    content += block.toMarkdown();
  }

  return content;
}

export async function getPost(api: NotionAPI, id: string): Promise<BlogPost> {
  const post = new BlogPost(id);

  const command = new GetPageCommand({ page_id: id });
  const res = await api.send(command);
  if (!res.ok) return new NullBlogPost();
  const page = new NotionAPIPageAdapter(res.res);

  const title = page.readTitle('title');
  const date = page.readDate('Date');
  const authorIds = page.readPeopleId('author');
  const tags = page.readMultiSelect('tag');

  post.title = title;
  post.createdAt = date;
  for (const id of authorIds) {
    const getUserCommand = new GetUserCommand({ user_id: id });
    const res = await api.send(getUserCommand);
    if (!res.ok) continue;
    if (res.res.name) post.addAuthor(res.res.name);
  }
  for (const tag of tags) post.addTag(tag);

  return post;
}
