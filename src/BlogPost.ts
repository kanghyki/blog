import { NotionAPI, getBlocks } from './notion.service';

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

  public async readPostBlocks(): Promise<void> {
    const notionAPI = NotionAPI.getInstance().getClient();

    this._content = await getBlocks(notionAPI, this.id);
  }
}

export class NullBlogPost extends BlogPost {
  constructor() {
    super('');
  }

  public override async readPostBlocks(): Promise<void> {}
}
