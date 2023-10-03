import { getReadableBlogPosts, getSingleBlogPost } from '@/src/notion.service';
import { DateStringType, dateToString } from '@/src/util';
import { BlogPost } from '@/src/BlogPost';
import MarkdownIt from 'markdown-it';

type PostParamsProps = {
  id: string;
};

export default async function Post({ params }: { params: PostParamsProps }) {
  const taskLists = require('markdown-it-task-lists');
  const md = new MarkdownIt({
    html: true,
    breaks: true,
  }).use(taskLists);
  const { id } = params;
  const post: BlogPost = await getSingleBlogPost(id);
  await post.readPostBlocks();

  return (
    <>
      <title>{`${post.title} - ${process.env.TITLE}`}</title>
      <header>
        <h1>{post.title}</h1>
        <h4>
          <time>{`${dateToString(post.createdAt, {
            type: DateStringType.MONTH_DATE_YEAR,
            time: false,
          })}`}</time>
          {` by ${post.author}`}
        </h4>
        <hr />
      </header>
      <article dangerouslySetInnerHTML={{ __html: md.render(post.content) }} />
    </>
  );
}

export async function generateStaticParams(): Promise<PostParamsProps[]> {
  const posts: BlogPost[] = await getReadableBlogPosts();

  return posts.map((post: BlogPost) => ({
    id: post.id,
  }));
}
