import { Client } from '@notionhq/client';

export interface Post {
  id: string;
  slug: string;
  title: string;
  name: string;
  createAt: Date;
  content: string;
  status: PostStatus;
}

export enum PostStatus {
  EDITING = 'Editing',
  SHOW = 'Show',
  NOT_SHOWN = 'Not shown',
}

export async function getReadablePosts(): Promise<Post[]> {
  const posts: Post[] = [];

  try {
    const notionAPI = new Client({
      auth: process.env.NOTION_SECRET_KEY,
    });

    const queryData = await notionAPI.databases.query({
      database_id: `${process.env.NOTION_DB_ID}`,
      filter: {
        property: 'Status',
        status: {
          equals: PostStatus.SHOW,
        },
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    queryData.results.forEach((e: any) => {
      let content = '';

      e.properties.content.rich_text.forEach((e: any) => {
        content += e.plain_text;
      });

      posts.push({
        id: e.id,
        title: e.properties.title.title[0].plain_text,
        createAt: new Date(e.properties.Date.date.start),
        name: e.properties.author.select.name,
        content: content,
        slug: e.properties.slug.rich_text[0].plain_text,
        status: e.properties.Status.status.name,
      });
    });
  } catch (e: any) {
    console.error('Notion error,', e);
  }

  return posts;
}
