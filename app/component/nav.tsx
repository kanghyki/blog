import Link from 'next/link';
import styles from './nav.module.css';

const navItems = [
  { href: '/', label: '소개' },
  { href: '/post', label: '글' },
];

export default async function Nav() {
  return (
    <nav>
      <div className={styles.nav_container}>
        <ul className={styles.nav}>
          {navItems.map((V, K) => (
            <li key={K}>
              <Link href={V.href}>{V.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
