'use client';
import Link from 'next/link';
import styles from './nav.module.css';
import { useEffect, useState } from 'react';

enum Theme {
  dark = 'Dark',
  light = 'Light',
}

export default function Nav() {
  const LocalStorageThemeKey = 'theme';
  const CssTheme = 'data-theme';
  const [theme, setTheme] = useState<string>(Theme.dark);

  useEffect(() => {
    const theme = window.localStorage.getItem(LocalStorageThemeKey);
    if (theme) setTheme(theme);
  }, []);

  useEffect(() => {
    localStorage.setItem(LocalStorageThemeKey, theme);
    document.body.setAttribute(CssTheme, theme);
  }, [theme]);

  const toggleTheme = () => {
    switch (theme) {
      case Theme.dark:
        setTheme(Theme.light);
        break;
      default:
        setTheme(Theme.dark);
        break;
    }
  };

  return (
    <nav>
      <div className={styles.nav_container}>
        <Link href="/">
          <h2>{`${process.env.NEXT_PUBLIC_LOGO}`}</h2>
        </Link>
        <ul className={styles.nav}>
          <button className={styles.theme_toggle} onClick={toggleTheme}>
            {theme}
          </button>
          <a href="/post">Post</a>
        </ul>
      </div>
    </nav>
  );
}
