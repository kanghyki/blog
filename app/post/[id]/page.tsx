import { getReadableBlogPosts, getSingleBlogPost } from '@/src/notion.service';
import { DateStringType, dateToString } from '@/src/util';
import { BlogPost } from '@/src/BlogPost';
import MarkdownIt from 'markdown-it';
import TagButton from '../TagButton';

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
  const posts: BlogPost[] = await getReadableBlogPosts();

  return posts.map((post: BlogPost) => ({
    id: post.id,
  }));
}
