import Link from 'next/link';
import styles from './nav.module.css';

const navItems = [{ href: '/post', label: 'Posts' }];

export default function Nav() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav_container}>
        <div className={styles.logo}>
          <Link href="/" className={styles.logo_link}>
            kanghyki<span className={styles.logo_method}>.note()</span>
          </Link>
        </div>
        <ul className={styles.nav}>
          {navItems.map((item, index) => (
            <li key={index}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
