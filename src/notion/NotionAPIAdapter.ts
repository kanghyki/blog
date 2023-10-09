import { isFullPage } from '@notionhq/client';
import {
  DatabaseObjectResponse,
  PageObjectResponse,
  QueryDatabaseResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

interface NotionAPIAdapter {}

export class NotionAPIDatabaseAdapter implements NotionAPIAdapter {
  private res: DatabaseObjectResponse;

  constructor(res: DatabaseObjectResponse) {
    this.res = res;
  }

  get id(): string {
    return this.res.id;
  }

  public readMultiSelect(key: string): string[] {
    const multiSelect: string[] = [];

    const property = this.res.properties[key];
    if (property.type === 'multi_select') {
      property.multi_select;
      /* SelectPropertyReponse */
      property.multi_select.options.forEach((e: { id: string; name: string; color: string }) => {
        multiSelect.push(e.name);
      });
    }

    return multiSelect;
  }
}

export class NotionAPIDatabaseQueryAdapter implements NotionAPIAdapter {
  private res: QueryDatabaseResponse;

  constructor(res: QueryDatabaseResponse) {
    this.res = res;
  }

  public getInnerPages(): PageObjectResponse[] {
    const res: PageObjectResponse[] = [];

    for (const page of this.res.results) {
      if (page.object !== 'page' || !isFullPage(page)) continue;
      res.push(page);
    }

    return res;
  }
}

export class NotionAPIPageAdapter implements NotionAPIAdapter {
  private res: PageObjectResponse;

  constructor(res: PageObjectResponse) {
    this.res = res;
  }

  get id(): string {
    return this.res.id;
  }

  public readMultiSelect(key: string): string[] {
    const multiSelect: string[] = [];

    const property = this.res.properties[key];
    if (property.type === 'multi_select') {
      for (const tag of property.multi_select) {
        if (tag.name) multiSelect.push(tag.name);
      }
    }

    return multiSelect;
  }

  public readTitle(key: string): string {
    let title = '';

    const property = this.res.properties[key];
    if (property.type === 'title') {
      property.title.forEach((e: RichTextItemResponse) => {
        title += e.plain_text;
      });
    }

    return title;
  }

  public readDate(key: string): Date {
    const property = this.res.properties[key];
    if (property.type === 'date' && property.date) return new Date(property.date.start);
    return new Date(0);
  }

  public readPeopleId(key: string): string[] {
    const people: string[] = [];

    const property = this.res.properties[key];
    if (property.type === 'people') {
      for (const person of property.people) people.push(person.id);
    }

    return people;
  }
}
