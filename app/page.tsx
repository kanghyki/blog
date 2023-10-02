import { NotionAPI, getBlocks } from '@/src/notion.service';
import MarkdownIt from 'markdown-it';

export default async function Home() {
  const taskLists = require('markdown-it-task-lists');
  const md = new MarkdownIt({
    html: true,
  }).use(taskLists);
  const content = await getBlocks(NotionAPI.getInstance().getClient(), process.env.NOTION_INTRODUCTION_PAGE_ID);

  return (
    <main>
      <article dangerouslySetInnerHTML={{ __html: md.render(content) }} />
    </main>
  );
}
