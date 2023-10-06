import Link from 'next/link';
import styles from './nav.module.css';
import ThemeButton from './ThemeButton';

export default async function Nav() {
  return (
    <nav>
      <div className={styles.nav_container}>
        <Link href="/">
          <h2>{process.env.NEXT_PUBLIC_LOGO}</h2>
        </Link>
        <ul className={styles.nav}>
          <li>
            <ThemeButton />
          </li>
          <li>
            <a href="/about">About</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
