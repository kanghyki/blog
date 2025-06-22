'use client';

import { useEffect, useState } from 'react';
import styles from './TOC.module.css';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TOCProps {
  content: string;
}

export default function TOC({ content }: TOCProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    // HTML에서 헤딩 요소들을 추출하여 TOC 아이템들을 생성
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

    const items: TOCItem[] = Array.from(headings).map((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const title = heading.textContent || '';
      let id = heading.id;

      // ID가 없으면 생성
      if (!id) {
        id = title
          .toLowerCase()
          .replace(/[^\w\s가-힣-]/g, '') // 한글과 영문, 숫자, 하이픈만 허용
          .replace(/\s+/g, '-') // 공백을 하이픈으로
          .trim()
          .replace(/^-+|-+$/g, ''); // 시작과 끝의 하이픈 제거

        // 중복 방지
        if (items.some(item => item.id === id) || !id) {
          id = `heading-${index}`;
        }
      }

      return { id, title, level };
    });

    setTocItems(items);
  }, [content]);

  useEffect(() => {
    if (tocItems.length === 0) return;

    // 실제 DOM에서 헤딩 요소들에 ID 추가
    const headings = document.querySelectorAll(
      'article h1, article h2, article h3, article h4, article h5, article h6',
    );
    headings.forEach((heading, index) => {
      if (tocItems[index] && !heading.id) {
        heading.id = tocItems[index].id;
      }
    });

    // 스크롤 이벤트 리스너 (기존 코드와 유사한 방식)
    const handleScroll = () => {
      const sections = document.querySelectorAll(
        'article h1, article h2, article h3, article h4, article h5, article h6',
      );
      let currentSection = '';

      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionId = section.getAttribute('id');
        if (sectionTop <= 100 && sectionId) {
          // 100px 오프셋
          currentSection = sectionId;
        }
      });

      setActiveId(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 실행

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [tocItems]);

  const handleTOCClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className={styles.tocContainer}>
      <div className={`${styles.tocHeader} ${!isCollapsed ? styles.hasContent : ''}`}>
        <h3 className={styles.tocTitle}>목차</h3>
        <button
          className={styles.toggleButton}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? '목차 펼치기' : '목차 접기'}
        >
          {isCollapsed ? '펼치기' : '접기'}
        </button>
      </div>
      {!isCollapsed && (
        <nav className={styles.tocNav}>
          <ul className={styles.tocList}>
            {tocItems.map(item => (
              <li
                key={item.id}
                className={`${styles.tocItem} ${styles[`level${item.level}`]} ${
                  activeId === item.id ? styles.active : ''
                }`}
              >
                <a
                  href={`#${item.id}`}
                  onClick={e => {
                    e.preventDefault();
                    handleTOCClick(item.id);
                  }}
                  className={`${styles.tocLink} ${activeId === item.id ? styles.activeToc : ''}`}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
