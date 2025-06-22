export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        marginTop: '2em',
        padding: '2em 0 1em 0',
        borderTop: '1px solid var(--sub-color-deep-gray)',
        textAlign: 'center' as const,
        color: 'var(--sub-color-middle-gray)',
        fontSize: '0.9em',
      }}
    >
      <div style={{ marginBottom: '1em' }}>
        <a
          href={`mailto:${process.env.NEXT_PUBLIC_EMAIL}`}
          style={{
            color: 'var(--point-color-cyan)',
            textDecoration: 'none',
            margin: '0 1em',
            fontSize: '0.9em',
            transition: 'color 0.2s ease',
          }}
        >
          Email
        </a>
        <a
          href={process.env.NEXT_PUBLIC_GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--point-color-cyan)',
            textDecoration: 'none',
            margin: '0 1em',
            fontSize: '0.9em',
            transition: 'color 0.2s ease',
          }}
        >
          GitHub
        </a>
      </div>
      <p style={{ margin: '0', fontSize: '0.85em', opacity: 0.8 }}>Made with Next.js & Notion</p>
    </footer>
  );
}
