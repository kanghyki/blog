import { BlogPost } from '@/src/BlogPost';
import { getReadableBlogPosts, getTags } from '@/src/notion.service';
import { Suspense } from 'react';
import PostList from './PostList';

function Fallback() {
  return <>Fallback</>;
}

export default async function Posts() {
  const posts: BlogPost[] = await getReadableBlogPosts();
  const tags: string[] = await getTags();

  return (
    <main>
      <Suspense fallback={<Fallback />}>
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
      </Suspense>
    </main>
  );
}
