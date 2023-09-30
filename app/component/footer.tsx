import styles from './footer.module.css';

export default function Footer() {
  return (
    <footer>
      <hr />
      <ul className={styles.footer}>
        <a href={`${process.env.GITHUB}`}>
          <li className={styles.footer_item}>GitHub</li>
        </a>
        <a href={`mailto:${process.env.EMAIL}`}>
          <li className={styles.footer_item}>Email</li>
        </a>
      </ul>
    </footer>
  );
}
