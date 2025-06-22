'use client';

import { useState } from 'react';
import CategoryButton from './CategoryButton';
import styles from './CategoryList.module.css';

type PropsCategoryList = {
  categories: string[];
  setCategory: (e: string | undefined) => void;
  select: string | undefined;
};

export default function CategoryList(props: PropsCategoryList) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <div className={styles.categoryContainer}>
      <div className={`${styles.categoryHeader} ${!isCollapsed ? styles.hasContent : ''}`}>
        <h3 className={styles.categoryTitle}>카테고리</h3>
        <button
          className={styles.toggleButton}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? '카테고리 펼치기' : '카테고리 접기'}
        >
          {isCollapsed ? '펼치기' : '접기'}
        </button>
      </div>
      {!isCollapsed && (
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
      )}
    </div>
  );
}
