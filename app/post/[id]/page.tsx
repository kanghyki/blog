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
import type { Metadata } from 'next';

type PostParamsProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata(props: PostParamsProps): Promise<Metadata> {
  const params = await props.params;

  const notionAPI = new NotionAPI();
  const post = await getPost(notionAPI, params.id);

  return {
    title: `${post.title} - ${process.env.TITLE}`,
    description: `${post.summary}`,
  };
}

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
      <CodeCopyButton />
      <header className={styles.postHeader}>
        <div className={styles.titleSection}>
          <h1 className={styles.postTitle}>
            {post.icon && <span className={styles.postIcon}>{post.icon}</span>}
            {post.title}
          </h1>
        </div>

        <div className={styles.metaSection}>
          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Category</span>
              <span className={styles.metaValue}>{post.category || 'Uncategorized'}</span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Published</span>
              <span className={styles.metaValue}>
                <time>
                  {post.createdAt.getTime() === 0
                    ? 'No date'
                    : dateToString(post.createdAt, {
                        type: DateStringType.YEAR_MONTH_DATE,
                        time: false,
                      })}
                </time>
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Author</span>
              <span className={styles.metaValue}>
                {post.authors.length > 0 ? post.authors.join(', ') : 'Anonymous'}
              </span>
            </div>
          </div>
        </div>
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
