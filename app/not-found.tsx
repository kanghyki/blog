export default function NotFound() {
  return (
    <main>
      <article>
        <h2>404 Not found.</h2>
        <i>
          <a href="/post">
            <b>{`Read other posts >`}</b>
          </a>
          <br />
          <br />
          <a href={`mailto:${process.env.EMAIL}`}>
            <b>{`Contact me >`}</b>
          </a>
        </i>
      </article>
    </main>
  );
}
