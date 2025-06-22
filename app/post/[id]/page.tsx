import styles from './page.module.css';
import { DateStringType, dateToString } from '@/src/util';
import { getDbPage, getPost } from '@/src/BlogPost';
import { NotionAPI } from '@/src/notion/NotionAPI';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionToMarkdown } from 'notion-to-md';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remark2rehype from 'remark-rehype';
import remarkGfm from 'remark-gfm';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { ensureImageDownloaded } from './download';
import TOC from './TOC';
import CodeCopyButton from '@/app/component/CodeCopyButton';

type PostParamsProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Post(props: PostParamsProps) {
  const params = await props.params;

  const notionAPI = new NotionAPI();
  const post = await getPost(notionAPI, params.id);

  const n2m = new NotionToMarkdown({ notionClient: notionAPI.notionClient });
  n2m.setCustomTransformer('image', async block => {
    const { image } = block as any;
    const url = image.file.url;
    const ret = await ensureImageDownloaded(url, params.id);
    return `![${ret.fileName}](${ret.localPath})`;
  });
  const mdblocks = await n2m.pageToMarkdown(params.id);
  const mdText = n2m.toMarkdownString(mdblocks).parent;

  const html_text = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remark2rehype)
    .use(rehypeSlug)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .processSync(mdText)
    .toString();

  return (
    <>
      <title>{`${post.title} - ${process.env.TITLE}`}</title>
      <CodeCopyButton />
      <header>
        <h2>
          {post.icon && `${post.icon} `}
          {post.title}
        </h2>
        <div className={styles.info}>
          <span>{post.category ? `${post.category}` : '<No Category>'}</span>
          <span>
            <time>
              {post.createdAt.getTime() === 0
                ? '<No date>'
                : `${dateToString(post.createdAt, {
                    type: DateStringType.YEAR_MONTH_DATE,
                    time: false,
                  })}\t`}
            </time>
          </span>
          <span>{post.authors.length > 0 ? `${post.authors.join(', ')}` : '<No author>'}</span>
        </div>
        <hr />
      </header>
      <div className={styles.contentContainer}>
        <TOC content={html_text} />
        <article dangerouslySetInnerHTML={{ __html: html_text }} />
      </div>
    </>
  );
}

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const notionAPI = new NotionAPI();
  const res: PageObjectResponse[] = await getDbPage(notionAPI);

  return res.map((res: PageObjectResponse) => ({
    id: res.id,
  }));
}
