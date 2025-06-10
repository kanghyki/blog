import PostList from './PostList';
import { BlogPost, getPosts, getCategories } from '@/src/BlogPost';
import { NotionAPI } from '@/src/notion/NotionAPI';
import { Indexer } from '@/src/searcher/Indexer';
import { BlogPostConverter } from '@/src/searcher/Searcher';
import { Suspense } from 'react';

function Fallback() {
  return <>Loading...</>;
}
export default async function Home() {
  const notionAPI = new NotionAPI();
  const categories: string[] = await getCategories(notionAPI);
  const posts: BlogPost[] = await getPosts(notionAPI);

  const indexer = new Indexer({ caseInsensitive: true });
  const conv = new BlogPostConverter();
  for (const post of posts) indexer.index(post.id, conv.convert(post));
  const json = indexer.toJson();

  return (
    <main>
      <Suspense fallback={<Fallback />}>
        <PostList posts={posts.map((e: BlogPost) => e.toInterface())} categories={categories} indexJson={json} />
      </Suspense>
    </main>
  );
}
