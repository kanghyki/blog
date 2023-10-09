import MarkdownIt from 'markdown-it';
import { NotionAPI } from '@/src/notion/NotionAPI';
import { getPageContent } from '@/src/BlogPost';

export default async function About() {
  const taskLists = require('markdown-it-task-lists');
  const md = new MarkdownIt({
    html: true,
    breaks: true,
  }).use(taskLists);

  const notionAPI = new NotionAPI();
  const content = await getPageContent(notionAPI, `${process.env.NOTION_INTRODUCTION_PAGE_ID}`);

  return <article dangerouslySetInnerHTML={{ __html: md.render(content) }} />;
}
