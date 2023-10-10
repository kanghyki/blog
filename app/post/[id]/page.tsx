import styles from './page.module.css';
import MarkdownIt from 'markdown-it';
import { DateStringType, dateToString } from '@/src/util';
import { getDbPage, getPageContent, getPost } from '@/src/BlogPost';
import { NotionAPI } from '@/src/notion/NotionAPI';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import Link from 'next/link';

type PostParamsProps = {
  id: string;
};

export default async function Post({ params }: { params: PostParamsProps }) {
  const { id } = params;
  const taskLists = require('markdown-it-task-lists');
  const md = new MarkdownIt({
    html: true,
    breaks: true,
  }).use(taskLists);

  const notionAPI = new NotionAPI();
  const post = await getPost(notionAPI, id);
  post.content = await getPageContent(notionAPI, id);

  return (
    <>
      <title>{`${post.title} - ${process.env.TITLE}`}</title>
      <header>
        <h1>
          {post.icon && `${post.icon} `}
          {post.title}
        </h1>
        <div className={styles.info}>
          {post.category && (
            <>
              <span className={styles.category}>{post.category}</span>
              <span className={styles.divider}>{' | '}</span>
            </>
          )}
          <time className={styles.time}>{`${dateToString(post.createdAt, {
            type: DateStringType.YEAR_MONTH_DATE,
            time: false,
          })}\t`}</time>
          <span className={styles.divider}>{' | '}</span>
          <span className={styles.author_name}>
            {post.authors.length > 0 ? `${post.authors.join(', ')}` : 'Not set'}
          </span>
        </div>
        <hr />
      </header>
      <article dangerouslySetInnerHTML={{ __html: md.render(post.content) }} />
    </>
  );
}

export async function generateStaticParams(): Promise<PostParamsProps[]> {
  const notionAPI = new NotionAPI();
  const res: PageObjectResponse[] = await getDbPage(notionAPI);

  return res.map((res: PageObjectResponse) => ({
    id: res.id,
  }));
}
