import { Post, PostStatus, getReadablePosts } from '@/src/notion.service';
import MarkdownIt from 'markdown-it';
import { DateStringType, dateToString } from '@/src/util';

export default async function Post({ params }: any) {
  const { slug } = params;
  const post: Post = await getPost(slug);
  const dateOption = {
    type: DateStringType.MONTH_DATE_YEAR,
    time: false,
  };

  return (
    <>
      <title>{`${slug} - ${process.env.TITLE}`}</title>
      <header>
        <h1>{post.title}</h1>
        <h4>
          <time>{`${dateToString(post.createAt, dateOption)}`}</time>
          {` by ${post.name}`}
        </h4>
      </header>
      <article dangerouslySetInnerHTML={{ __html: new MarkdownIt().render(post.content) }}></article>
    </>
  );
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts: Post[] = await getReadablePosts();

  return posts.map((post: Post) => ({
    slug: post.slug,
  }));
}

async function getPost(slug: string): Promise<Post> {
  const posts: Post[] = await getReadablePosts();

  const post: Post | undefined = posts.find((e: Post) => {
    return e.slug === slug;
  });

  if (post === undefined) {
    return {
      id: '',
      slug: '',
      title: '[Error] 404 Not found.',
      name: 'system',
      createAt: new Date(0),
      content: '',
      status: PostStatus.NOT_SHOWN,
    };
  }

  return post;
}
