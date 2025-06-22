'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IBlogPost } from '@/src/BlogPost';
import { Searcher } from '@/src/searcher/Searcher';
import styles from './PostList.module.css';
import PostListItem from './PostListItem';
import CategoryList from '../component/CategoryList';

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
      <div className={styles.statusSection}>
        <div className={styles.statusInfo}>
          <PostListInfo count={posts.length} category={category} searchString={searchText} />
        </div>
        <div className={styles.searchContainer}>
          <SearchInput setSearchText={setSearchText} />
        </div>
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
  const hasFilters = props.category || props.searchString;

  return (
    <div className={styles.infoContainer}>
      {hasFilters && (
        <div className={styles.filterInfo}>
          {props.category && (
            <span className={styles.filterTag}>
              <span className={styles.filterLabel}>Category:</span>
              <span className={styles.filterValue}>{props.category}</span>
            </span>
          )}
          {props.searchString && (
            <span className={styles.filterTag}>
              <span className={styles.filterLabel}>Search:</span>
              <span className={styles.filterValue}>&ldquo;{props.searchString}&rdquo;</span>
            </span>
          )}
        </div>
      )}
      <div className={styles.countInfo}>
        <span className={styles.countNumber}>{props.count}</span>
        <span className={styles.countText}>개의 포스트</span>
      </div>
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
    <div className={styles.searchInputWrapper}>
      <div className={styles.searchIcon}>🔍</div>
      <input
        className={styles.searchInput}
        type="text"
        ref={searchBar}
        placeholder="검색어를 입력하세요... (⌘K)"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          props.setSearchText(e.target.value);
        }}
      />
    </div>
  );
}
