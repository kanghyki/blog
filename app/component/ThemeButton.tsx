'use client';
import styles from './ThemeButton.module.css';
import { useEffect, useState } from 'react';

enum Theme {
  dark = 'Dark',
  light = 'Light',
}

const LocalStorageThemeKey = 'theme';
const CssTheme = 'data-theme';

export default function ThemeButton() {
  const [theme, setTheme] = useState<string>(Theme.dark);

  /* Depends on layout.tsx metadata */
  const changeMetaThemeColor = (hexColor: string) => {
    const meta = document.querySelector("meta[name='theme-color']");
    if (meta) meta.setAttribute('content', hexColor);
  };

  useEffect(() => {
    const theme = window.localStorage.getItem(LocalStorageThemeKey);
    if (theme) setTheme(theme);
  }, []);

  useEffect(() => {
    localStorage.setItem(LocalStorageThemeKey, theme);
    document.body.setAttribute(CssTheme, theme);
    if (theme === Theme.dark) changeMetaThemeColor('#222831');
    else changeMetaThemeColor('#eeeeee');
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
    <button className={styles.theme_toggle} onClick={toggleTheme}>
      {theme === Theme.dark ? '🌙' : '☀️'}
    </button>
  );
}
