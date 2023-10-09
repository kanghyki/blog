import { Client, isFullBlock, isFullDatabase, isFullPage, isFullUser, iteratePaginatedAPI } from '@notionhq/client';
import {
  BlockObjectResponse,
  DatabaseObjectResponse,
  PageObjectResponse,
  QueryDatabaseParameters,
  UserObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export interface NotionAPICommand {
  execute(clinet: Client): any;
}

export class GetDatabaseCommand implements NotionAPICommand {
  private database_id: string;

  constructor(option: { database_id: string }) {
    this.database_id = option.database_id;
  }

  public async execute(client: Client): Promise<DatabaseObjectResponse | undefined> {
    const database = await client.databases.retrieve({
      database_id: this.database_id,
    });

    if (isFullDatabase(database)) return database;
    return undefined;
  }
}

export class GetDatabaseQueryCommand implements NotionAPICommand {
  private params: QueryDatabaseParameters;

  constructor(option: { params: QueryDatabaseParameters }) {
    this.params = option.params;
  }

  public async execute(client: Client): Promise<PageObjectResponse[]> {
    const query: PageObjectResponse[] = [];

    const dbPages = await client.databases.query({
      ...this.params,
    });
    for (const page of dbPages.results) {
      if (page.object !== 'page' || !isFullPage(page)) continue;
      query.push(page);
    }

    return query;
  }
}

export class GetPageCommand implements NotionAPICommand {
  private page_id: string;

  constructor(option: { page_id: string }) {
    this.page_id = option.page_id;
  }

  public async execute(client: Client): Promise<PageObjectResponse | undefined> {
    const page = await client.pages.retrieve({ page_id: this.page_id });

    if (isFullPage(page)) return page;
    return undefined;
  }
}

export class GetBlockResponseNode {
  public block: BlockObjectResponse;
  private _children?: GetBlockResponseNode[];

  constructor(block: BlockObjectResponse) {
    this.block = block;
  }

  set children(c: GetBlockResponseNode[]) {
    this._children = c;
  }

  get children(): GetBlockResponseNode[] | undefined {
    return this._children;
  }
}

export class GetBlockCommand implements NotionAPICommand {
  private page_id: string;
  private maxDepth: number;

  constructor(option: { page_id: string; maxDepth?: number }) {
    this.page_id = option.page_id;
    option.maxDepth ? (this.maxDepth = option.maxDepth) : (this.maxDepth = 0);
  }

  private async getBlock(client: Client, pageId: string, depth: number = 0): Promise<GetBlockResponseNode[]> {
    if (depth > this.maxDepth) return [];
    const ret: GetBlockResponseNode[] = [];

    for await (const block of iteratePaginatedAPI(client.blocks.children.list, {
      block_id: pageId,
    })) {
      if (!isFullBlock(block)) continue;
      const node = new GetBlockResponseNode(block);
      if (block.has_children) node.children = await this.getBlock(client, block.id, depth);
      ret.push(node);
    }

    return ret;
  }

  public async execute(client: Client): Promise<GetBlockResponseNode[]> {
    return await this.getBlock(client, this.page_id);
  }
}

export class GetUserCommand implements NotionAPICommand {
  private user_id: string;

  constructor(option: { user_id: string }) {
    this.user_id = option.user_id;
  }

  public async execute(client: Client): Promise<UserObjectResponse | undefined> {
    const user = await client.users.retrieve({ user_id: this.user_id });

    if (isFullUser(user)) return user;
    return undefined;
  }
}
