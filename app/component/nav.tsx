import Link from 'next/link';
import styles from './nav.module.css';
import ThemeButton from './ThemeButton';

export default async function Nav() {
  return (
    <nav>
      <div className={styles.nav_container}>
        <ul className={styles.nav}>
          <li>
            <Link href={`${process.env.NEXT_PUBLIC_ROOT_PATH}`}>소개</Link>
          </li>
          <li>
            <Link href={`${process.env.NEXT_PUBLIC_POST_PATH}`}>글</Link>
          </li>
        </ul>
        <ThemeButton />
      </div>
    </nav>
  );
}
