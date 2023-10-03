import { getReadableBlogPosts } from '@/src/notion.service';
import { DateStringType, dateToString } from '@/src/util';
import { BlogPost, NullBlogPost } from '@/src/BlogPost';
import MarkdownIt from 'markdown-it';

type PostParamsProps = {
  title: string;
};

export default async function Post({ params }: { params: PostParamsProps }) {
  const taskLists = require('markdown-it-task-lists');
  const md = new MarkdownIt({
    html: true,
    breaks: true,
  }).use(taskLists);

  const { title } = params;
  const decodedURI = decodeURI(title);

  const post: BlogPost = await getPost(decodedURI);
  await post.readPostBlocks();

  return (
    <>
      <title>{`${decodedURI} - ${process.env.TITLE}`}</title>
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
    title: post.title,
  }));
}

async function getPost(title: string): Promise<BlogPost> {
  const posts: BlogPost[] = await getReadableBlogPosts();
  const post: BlogPost | undefined = posts.find((e: BlogPost) => e.title === decodeURI(title));

  return post ? post : new NullBlogPost();
}
