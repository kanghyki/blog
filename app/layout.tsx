import './globals.css';
import Nav from './component/nav';
import Footer from './component/footer';

import type { Metadata } from 'next';
import { Roboto_Mono } from 'next/font/google';

const roboto = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
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
        alt: 'alt',
      },
    ],
  },
  themeColor: '#222831', // default dark
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={roboto.className}>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
