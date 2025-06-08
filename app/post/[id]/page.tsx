import styles from './page.module.css';
import { DateStringType, dateToString } from '@/src/util';
import { getDbPage, getPageContent, getPost } from '@/src/BlogPost';
import { NotionAPI } from '@/src/notion/NotionAPI';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { remark } from 'remark';
import html from 'remark-html';

type PostParamsProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Post(props: PostParamsProps) {
  const params = await props.params;

  const notionAPI = new NotionAPI();
  const post = await getPost(notionAPI, params.id);
  post.content = await getPageContent(notionAPI, params.id);

  const processedContent = await remark().use(html).process(post.content);
  const contentHtml = processedContent.toString();

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
              <span className={styles.divider}>{'|'}</span>
            </>
          )}
          <time className={styles.time}>{`${dateToString(post.createdAt, {
            type: DateStringType.YEAR_MONTH_DATE,
            time: false,
          })}\t`}</time>
          <span className={styles.divider}>{'|'}</span>
          <span className={styles.author_name}>
            {post.authors.length > 0 ? `${post.authors.join(', ')}` : 'Not set'}
          </span>
        </div>
        <hr />
      </header>
      <article dangerouslySetInnerHTML={{ __html: contentHtml }} />
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
