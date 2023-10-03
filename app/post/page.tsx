import { BlogPost } from '@/src/BlogPost';
import { getReadableBlogPosts, getTags } from '@/src/notion.service';
import PostList from './PostList';

export default async function Posts() {
  const posts: BlogPost[] = await getReadableBlogPosts();
  const tags: string[] = await getTags();

  return (
    <main>
      <PostList
        posts={posts.map((e: BlogPost) => ({
          id: e.id,
          title: e.title,
          createdAt: e.createdAt,
          content: e.content,
          authors: e.authors,
          tags: e.tags,
        }))}
        tags={tags}
      />
    </main>
  );
}
