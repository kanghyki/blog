import 'server-only';
import { Client, LogLevel } from '@notionhq/client';
import {
  GetBlockCommand,
  GetBlockResponseNode,
  GetDatabaseCommand,
  GetDatabaseQueryCommand,
  GetPageCommand,
  GetUserCommand,
  NotionAPICommand,
} from './NotionAPICommand';
import {
  DatabaseObjectResponse,
  PageObjectResponse,
  UserObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

type CommandResponseType<T> = T extends GetDatabaseCommand
  ? DatabaseObjectResponse
  : T extends GetDatabaseQueryCommand
  ? PageObjectResponse[]
  : T extends GetPageCommand
  ? PageObjectResponse
  : T extends GetBlockCommand
  ? GetBlockResponseNode[]
  : T extends GetUserCommand
  ? UserObjectResponse
  : never;

export class NotionAPI {
  private notionClient: Client;

  constructor() {
    this.notionClient = new Client({
      auth: process.env.NOTION_SECRET_KEY,
      logLevel: LogLevel.WARN,
    });
  }

  public async send<T extends NotionAPICommand>(command: T): Promise<CommandResponseType<T> | undefined> {
    try {
      return await command.execute(this.notionClient);
    } catch (error) {}

    return undefined;
  }
}
