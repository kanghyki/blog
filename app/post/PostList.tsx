'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './PostList.module.css';
import PostListItem from './PostListItem';
import CategoryButton from '../component/CategoryButton';
import { IBlogPost } from '@/src/BlogPost';
import { Searcher } from '@/src/searcher/Searcher';

type PropsPostList = {
  posts: IBlogPost[];
  categories: string[];
  indexJson: string;
};

export default function PostList(props: PropsPostList) {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [acList, setAcList] = useState<string[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<IBlogPost[]>(props.posts);
  const searcher = useMemo(() => {
    const s = new Searcher({ caseInsensitive: true });
    s.getIndexer().fromJson(props.indexJson);
    return s;
  }, [props]);

  const debounce = useCallback((fn: () => void, ms: number = 250): (() => void) => {
    let timeout: NodeJS.Timeout;

    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(fn, ms);
    };
  }, []);

  const update = useCallback((): void => {
    let categoryPosts: IBlogPost[] = [];

    if (category) categoryPosts = props.posts.filter((post: IBlogPost) => post.category === category);
    else categoryPosts = props.posts;

    if (searchText) {
      setAcList(searcher.autoComplete(searchText, { max: 5 }));
      const searchPostIds = searcher.search(searchText);
      setFilteredPosts(categoryPosts.filter(cp => searchPostIds.includes(cp.id)));
    } else {
      setAcList([]);
      setFilteredPosts(categoryPosts);
    }
  }, [searchText, category, props, searcher]);

  useEffect(() => {
    debounce(update)();
  }, [searchText, category, debounce, update]);

  return (
    <>
      <CategoryList categories={props.categories} setCategory={setCategory} select={category} />
      <div className={styles.status_bar}>
        <PostListInfo count={filteredPosts.length} category={category} searchString={searchText} />
        <SearchInput setSearchText={setSearchText} />
      </div>
      <PostAcList acList={acList} setSearchText={setSearchText} />
      <ul>
        {filteredPosts.map((e: IBlogPost) => (
          <PostListItem post={e} key={e.id} />
        ))}
      </ul>
    </>
  );
}

type PropsAcList = {
  acList: string[];
  setSearchText: (s: string) => void;
};

function PostAcList(props: PropsAcList) {
  return (
    <>
      {props.acList.length > 0 && (
        <p className={styles.auto_complete}>
          {`일치하는 검색어*`}
          {props.acList.map(e => (
            <button
              key={e}
              onClick={() => {
                props.setSearchText(e);
              }}
            >
              {e}
            </button>
          ))}
        </p>
      )}
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
      {props.category && <strong className={styles.strong}>{`[${props.category}]`}</strong>}
      {props.category && props.searchString && ' '}
      {props.searchString && <strong className={styles.strong}>{`${props.searchString}`}</strong>}
      {(props.category || props.searchString) && ' > '}
      {
        <>
          {`총 `}
          <strong className={styles.strong}>{props.count}</strong>
          {`개의 포스트`}
        </>
      }
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
