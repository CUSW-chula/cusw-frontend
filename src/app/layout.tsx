import type { Metadata } from 'next';
import { Bai_Jamjuree, Anuphan } from 'next/font/google';
import './globals.css';

const bai_jamjuree = Bai_Jamjuree({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-bai_jamjuree',
  display: 'swap',
});

const anuphan = Anuphan({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-anuphan',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CUSW workspace',
  description: 'CUSW workspace for taks management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bai_jamjuree.variable} ${anuphan.variable} antialiased w-full px-[10%] py-[5%] justify-center`}>{children}</body>
    </html>
  );
}
