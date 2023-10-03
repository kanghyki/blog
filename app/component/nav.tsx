import Link from 'next/link';
import styles from './nav.module.css';

export default function Nav() {
  return (
    <nav>
      <div className={styles.nav_container}>
        <Link href="/">
          <h2>{`${process.env.LOGO}`}</h2>
        </Link>
        <ul className={styles.nav}>
          <Link href="/post">Post</Link>
        </ul>
      </div>
    </nav>
  );
}
