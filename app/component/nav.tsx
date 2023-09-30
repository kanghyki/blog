import styles from './nav.module.css';

export default function Nav() {
  return (
    <nav>
      <div className={styles.nav_container}>
        <a href="/">
          <h2>{`${process.env.LOGO}`}</h2>
        </a>
        <ul className={styles.nav}>
          <a href="/post">
            <li>Post</li>
          </a>
        </ul>
      </div>
    </nav>
  );
}
