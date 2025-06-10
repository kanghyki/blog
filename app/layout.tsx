import './globals.css';
import Nav from './component/nav';

import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR } from 'next/font/google';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  style: 'normal',
  variable: '--noto-sans-kr',
  display: 'fallback',
  fallback: ['system-ui'],
});

export const metadata: Metadata = {
  metadataBase: new URL(`${process.env.OG_URL}`),
  title: `${process.env.TITLE}`,
  description: `${process.env.DESCRIPTION}`,
  openGraph: {
    type: 'website',
    url: `${process.env.OG_URL}`,
    description: `${process.env.DESCRIPTION}`,
    siteName: `${process.env.OG_SITE_NAME}`,
    locale: `${process.env.OG_LOCALE}`,
    images: [
      {
        url: `${process.env.OG_IMAGE_URL}`,
        width: 420,
        height: 420,
        alt: 'image',
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#181818',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="google-site-verification" content="ifIm20wXN4mCuEPDYXfgfyeK9Ko1mpXG8Jhw9YhfZPQ" />
      </head>
      <body className={notoSansKr.className}>
        <Nav />
        {children}
      </body>
    </html>
  );
}
