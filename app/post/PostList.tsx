'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './PostList.module.css';
import PostListItem from './PostListItem';
import CategoryButton from '../component/CategoryButton';
import { IBlogPost } from '@/src/BlogPost';

type Props = {
  posts: IBlogPost[];
  tags: string[];
};

export default function PostList(props: Props) {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<string | undefined>(searchParams.get('category') || undefined);

  const changeQueryShallow = (key: string, value?: string | null) => {
    if (!window.history.pushState) return;
    const host = window.location.protocol + '//' + window.location.host + window.location.pathname;
    const newurl = value ? host + `?${key}=${value}` : host;
    window.history.pushState({ path: newurl }, '', newurl);
  };

  const getPostIncludedTag = () => {
    return category ? props.posts.filter((post: IBlogPost) => post.category === category) : props.posts;
  };

  useEffect(() => {
    changeQueryShallow('category', category);
  }, [category]);

  return (
    <>
      <div className={styles.tag_button_container}>
        <CategoryButton category={'전체'} onClick={() => setCategory(undefined)} />
        {props.tags.map((e: string) => (
          <CategoryButton category={e} key={e} onClick={() => setCategory(e)} />
        ))}
      </div>
      <p>
        {category && (
          <>
            <strong className={styles.strong}>#{category}</strong>
            {` >  `}
          </>
        )}
        {
          <>
            {`총 `}
            <strong className={styles.strong}>{getPostIncludedTag().length}</strong>
            {`개의 포스트`}
          </>
        }
      </p>
      <ul>
        {getPostIncludedTag().map((e: IBlogPost) => (
          <PostListItem post={e} key={e.id} />
        ))}
      </ul>
    </>
  );
}
