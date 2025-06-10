import { NotionAPI } from '@/src/notion/NotionAPI';
import { NotionToMarkdown } from 'notion-to-md';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remark2rehype from 'remark-rehype';
import remarkGfm from 'remark-gfm';
import rehypeStringify from 'rehype-stringify';
import { ensureImageDownloaded } from './post/[id]/download';
import remarkToc from 'remark-toc';

export default async function About() {
  const pageId = process.env.NOTION_INTRODUCTION_PAGE_ID || '';

  const notionAPI = new NotionAPI();
  const n2m = new NotionToMarkdown({ notionClient: notionAPI.notionClient });
  n2m.setCustomTransformer('image', async block => {
    const { image } = block as any;
    const url = image.file.url;
    const ret = await ensureImageDownloaded(url, pageId);
    return `![${ret.fileName}](${ret.localPath})`;
  });
  n2m.setCustomTransformer('table_of_contents', async block => {
    return `### 목차`;
  });
  const mdblocks = await n2m.pageToMarkdown(pageId);
  const mdText = n2m.toMarkdownString(mdblocks).parent;

  const html_text = unified()
    .use(remarkParse)
    .use(remarkToc, { heading: '목차', ordered: true, maxDepth: 3 })
    .use(remarkGfm)
    .use(remark2rehype)
    .use(rehypeStringify)
    .processSync(mdText)
    .toString();

  return <article dangerouslySetInnerHTML={{ __html: html_text }} />;
}
