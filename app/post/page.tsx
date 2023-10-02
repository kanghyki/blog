import { BlogPost } from '@/src/BlogPost';
import { getReadableBlogPosts } from '@/src/notion.service';
import { DateStringType, dateToString } from '@/src/util';

export default async function Posts() {
  const posts: BlogPost[] = await getReadableBlogPosts();

  return (
    <main>
      <ul>
        {posts.map((e: BlogPost) => (
          <a key={e.id} href={`/post/${e.title}`}>
            <li>
              <time>{`${dateToString(e.createdAt, {
                type: DateStringType.MONTH_DATE_YEAR,
                time: false,
              })}\t`}</time>
              {`${e.title}`}
            </li>
          </a>
        ))}
      </ul>
    </main>
  );
}
