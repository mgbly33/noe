import type { Metadata } from 'next';
import { Cormorant_Garamond, Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google';

import './globals.css';

const displayFont = Noto_Serif_SC({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const bodyFont = Noto_Sans_SC({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const accentFont = Cormorant_Garamond({
  variable: '--font-accent',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Noe Tarot',
  description: 'A gentle tarot H5 flow for reflection, ritual, and follow-up guidance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${displayFont.variable} ${bodyFont.variable} ${accentFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
