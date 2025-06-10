'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IBlogPost } from '@/src/BlogPost';
import { Searcher } from '@/src/searcher/Searcher';
import styles from './PostList.module.css';
import PostListItem from './PostListItem';
import CategoryButton from '../component/CategoryButton';

type PropsPostList = {
  posts: IBlogPost[];
  categories: string[];
  indexJson: string;
};

export default function PostList(props: PropsPostList) {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [posts, setPosts] = useState<IBlogPost[]>(props.posts);
  const searcher = useMemo(() => {
    const s = new Searcher({ caseInsensitive: true });
    s.getIndexer().fromJson(props.indexJson);
    return s;
  }, [props]);

  const update = useCallback((): void => {
    let categoryPosts: IBlogPost[] = [];

    if (category) categoryPosts = props.posts.filter((post: IBlogPost) => post.category === category);
    else categoryPosts = props.posts;

    if (searchText) {
      const searchPostIds = searcher.search(searchText);
      setPosts(categoryPosts.filter(cp => searchPostIds.includes(cp.id)));
    } else {
      setPosts(categoryPosts);
    }
  }, [searchText, category, props, searcher]);

  useEffect(() => {
    const timeout: NodeJS.Timeout = setTimeout(() => {
      update();
    }, 250);
    return () => {
      clearTimeout(timeout);
    };
  }, [searchText, category, update]);

  return (
    <>
      <CategoryList categories={props.categories} setCategory={setCategory} select={category} />
      <div className={styles.status_bar}>
        <PostListInfo count={posts.length} category={category} searchString={searchText} />
        <SearchInput setSearchText={setSearchText} />
      </div>
      <ul>
        {posts.map((e: IBlogPost) => (
          <PostListItem post={e} key={e.id} />
        ))}
      </ul>
    </>
  );
}

type PropsPostListInfo = {
  count: number;
  category?: string;
  searchString?: string;
};

function PostListInfo(props: PropsPostListInfo) {
  return (
    <span>
      {props.category && props.category}
      {props.searchString && ` ${props.searchString}`}
      {(props.category || props.searchString) && ' > '}
      {`총 ${props.count}개의 글`}
    </span>
  );
}

type PropsCategoryList = {
  categories: string[];
  setCategory: (e: string | undefined) => void;
  select: string | undefined;
};

function CategoryList(props: PropsCategoryList) {
  return (
    <div className={styles.tag_button_container}>
      <CategoryButton
        select={props.select === undefined}
        category={'전체'}
        onClick={() => props.setCategory(undefined)}
      />
      {props.categories.map((e: string) => (
        <CategoryButton select={props.select === e} category={e} key={e} onClick={() => props.setCategory(e)} />
      ))}
    </div>
  );
}

type SearchInputProps = {
  setSearchText: (e: string) => void;
};

function SearchInput(props: SearchInputProps) {
  const searchBar = useRef<HTMLInputElement>(null);
  useEffect(() => {
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyK') {
        if (searchBar.current) searchBar.current.focus();
      }
    });
  }, []);

  return (
    <>
      <input
        className={styles.input_box}
        type="text"
        ref={searchBar}
        placeholder="검색어를 입력해 주세요."
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          props.setSearchText(e.target.value);
        }}
      />
    </>
  );
}
