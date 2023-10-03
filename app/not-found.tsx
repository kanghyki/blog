import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <article>
        <h2>404 Not found.</h2>
        <i>
          <Link href="/post">
            <b>{`Read other posts >`}</b>
          </Link>
        </i>
      </article>
    </main>
  );
}
