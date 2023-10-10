import MarkdownIt from 'markdown-it';
import TagButton from '@/app/component/TagButton';
import { DateStringType, dateToString } from '@/src/util';
import { getDbPage, getPageContent, getPost } from '@/src/BlogPost';
import { NotionAPI } from '@/src/notion/NotionAPI';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

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
        <p>
          <time>{`${dateToString(post.createdAt, {
            type: DateStringType.YEAR_MONTH_DATE,
            time: false,
          })}`}</time>
          {` / ${post.authors.join(', ')}`}
        </p>
        {post.tags.map((e: string) => (
          <TagButton tag={e} key={e} link={true} />
        ))}
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
