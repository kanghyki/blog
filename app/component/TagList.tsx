'use client';

import { useState } from 'react';
import styles from './TagList.module.css';

interface TagListProps {
  tags: string[];
  maxVisible?: number;
  onTagClick?: (tag: string) => void;
}

export default function TagList({ tags, maxVisible = 3, onTagClick }: TagListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!tags || tags.length === 0) {
    return null;
  }

  const visibleTags = isExpanded ? tags : tags.slice(0, maxVisible);
  const hiddenCount = tags.length - maxVisible;

  return (
    <div className={styles.tagContainer}>
      <div className={styles.tagList}>
        {visibleTags.map((tag, index) => (
          <button key={index} className={styles.tag} onClick={() => onTagClick?.(tag)} disabled={!onTagClick}>
            {tag}
          </button>
        ))}

        {!isExpanded && hiddenCount > 0 && (
          <button
            className={styles.expandButton}
            onClick={() => setIsExpanded(true)}
            aria-label={`Show ${hiddenCount} more tags`}
          >
            +{hiddenCount} more
          </button>
        )}

        {isExpanded && tags.length > maxVisible && (
          <button className={styles.collapseButton} onClick={() => setIsExpanded(false)} aria-label="Show fewer tags">
            Show less
          </button>
        )}
      </div>
    </div>
  );
}
