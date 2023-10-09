import 'server-only';
import { Client, LogLevel } from '@notionhq/client';
import { NotionAPICommand } from './NotionAPICommand';

export class NotionAPI {
  private notionClient: Client;

  constructor() {
    this.notionClient = new Client({
      auth: process.env.NOTION_SECRET_KEY,
      logLevel: LogLevel.WARN,
    });
  }

  public async send(command: NotionAPICommand): Promise<{ ok: boolean; res: any }> {
    try {
      const res = await command.execute(this.notionClient);
      if (res)
        return {
          ok: true,
          res: res,
        };
    } catch (error) {}

    return {
      ok: false,
      res: undefined,
    };
  }
}
