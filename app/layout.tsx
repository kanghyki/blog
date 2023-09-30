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
  title: `${process.env.TITLE}`,
  description: `${process.env.DESCRIPTION}`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
