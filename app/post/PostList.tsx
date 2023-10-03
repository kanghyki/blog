'use client';
import styles from './PostList.module.css';
import { useEffect, useState } from 'react';
import PostListItem from './PostListItem';
import TagButton from './TagButton';
import { useSearchParams } from 'next/navigation';

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
  const AllTag: string = '전체';
  const searchParams = useSearchParams();
  const querytag = searchParams.get('tag');
  const [tag, setTag] = useState<string>(querytag ? querytag : AllTag);
  const [foundPosts, setFoundPosts] = useState<PostProp[]>(props.posts);

  const changeQueryShallow = (key: string, value: string) => {
    if (!window.history.pushState) return;
    const host = window.location.protocol + '//' + window.location.host + window.location.pathname;
    const query = `?${key}=${value}`;
    const newurl = host + query;
    window.history.pushState({ path: newurl }, '', newurl);
  };

  useEffect(() => {
    changeQueryShallow('tag', tag);
  }, [tag]);

  const changeTag = (vtag: string) => {
    setTag(vtag);
    if (vtag === AllTag) setFoundPosts(props.posts);
    else setFoundPosts(props.posts.filter((post: PostProp) => post.tags.includes(vtag)));
  };

  return (
    <>
      <div className={styles.tag_button_container}>
        <TagButton tag={AllTag} onClick={() => changeTag(AllTag)} />
        {props.tags.map((e: string) => (
          <TagButton tag={e} key={e} onClick={() => changeTag(e)} />
        ))}
      </div>
      <p>
        <strong className={styles.strong}>{tag}</strong>
        {` 검색 결과: `}
        <strong className={styles.strong}>{foundPosts.length}</strong>
        {` 건의 포스팅을 찾았습니다.`}
      </p>
      <ul>
        {foundPosts.map((e: PostProp) => (
          <PostListItem post={e} key={e.id} />
        ))}
      </ul>
    </>
  );
}
