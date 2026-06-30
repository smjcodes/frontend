import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Contest Demo UI',
  description: 'Minimal Next.js frontend for the Strapi contest participation system.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="page-shell">{children}</main>
      </body>
    </html>
  );
}
