import { UserObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionAPI, getBlocks } from './notion.service';

export enum BlogPostStatus {
  EDITING = 'Editing',
  SHOW = 'Show',
  NOT_SHOWN = 'Not shown',
}

export class BlogPost {
  private _id: string;
  private _title: string;
  private _author: UserObjectResponse[];
  private _createdAt: Date;
  private _content: string;

  constructor(_id: string) {
    this._id = _id;
    this._title = '';
    this._author = [];
    this._createdAt = new Date(0);
    this._content = '';
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

  get authorNameList(): string[] {
    const userNames: string[] = [];

    for (const userObj of this._author) {
      if (userObj.name) userNames.push(userObj.name);
    }

    return userNames;
  }

  set author(_author: UserObjectResponse[]) {
    this._author = _author;
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
