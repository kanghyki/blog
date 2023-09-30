import { Post, getReadablePosts } from '@/src/notion.service';
import { DateStringType, dateToString } from '@/src/util';

export default async function Posts() {
  const posts: Post[] = await getReadablePosts();

  const dateOption = {
    type: DateStringType.MONTH_DATE_YEAR,
    time: false,
  };

  return (
    <main>
      <ul>
        {posts.length > 0 ? (
          posts.map((e: Post) => (
            <a key={e.id} href={`/post/${e.slug}`}>
              <li>
                <time>{`${dateToString(e.createAt, dateOption)}\t`}</time>
                {`${e.title}`}
              </li>
            </a>
          ))
        ) : (
          <li>No content</li>
        )}
      </ul>
    </main>
  );
}
