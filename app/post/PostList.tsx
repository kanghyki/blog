'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './PostList.module.css';
import PostListItem from './PostListItem';
import TagButton from '../component/TagButton';

export type PostProp = {
  id: string;
  title: string;
  createdAt: Date;
  content: string;
  authors: string[];
  tags: string[];
};

type Props = {
  posts: PostProp[];
  tags: string[];
};

export default function PostList(props: Props) {
  const searchParams = useSearchParams();
  const [tag, setTag] = useState<string | undefined>(searchParams.get('tag') || undefined);

  const changeQueryShallow = (key: string, value?: string | null) => {
    if (!window.history.pushState) return;
    const host = window.location.protocol + '//' + window.location.host + window.location.pathname;
    const newurl = value ? host + `?${key}=${value}` : host;
    window.history.pushState({ path: newurl }, '', newurl);
  };

  const getPostIncludedTag = () => {
    return tag ? props.posts.filter((post: PostProp) => post.tags.includes(tag)) : props.posts;
  };

  useEffect(() => {
    changeQueryShallow('tag', tag);
  }, [tag]);

  return (
    <>
      <div className={styles.tag_button_container}>
        <TagButton tag={'전체'} onClick={() => setTag(undefined)} />
        {props.tags.map((e: string) => (
          <TagButton tag={e} key={e} onClick={() => setTag(e)} />
        ))}
      </div>
      <p>
        {tag && (
          <>
            <strong className={styles.strong}>#{tag}</strong>
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
        {getPostIncludedTag().map((e: PostProp) => (
          <PostListItem post={e} key={e.id} />
        ))}
      </ul>
    </>
  );
}
