import Link from 'next/link';
import styles from './nav.module.css';

const navItems = [
  { href: '/', label: '소개' },
  { href: '/post', label: '글' },
];

export default function Nav() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav_container}>
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
