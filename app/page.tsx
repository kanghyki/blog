import PostList from './post/PostList';
import { BlogPost, getPosts, getTags } from '@/src/BlogPost';
import { NotionAPI } from '@/src/notion/NotionAPI';
import { Suspense } from 'react';

function Fallback() {
  return <>Loading...</>;
}
export default async function Home() {
  const notionAPI = new NotionAPI();
  const tags: string[] = await getTags(notionAPI);
  const posts: BlogPost[] = await getPosts(notionAPI);

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
