import type { Metadata } from 'next';
import { Bai_Jamjuree, Anuphan } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/elements/nav-bar';

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
      <body
        className={`min-h-lvh ${bai_jamjuree.variable} ${anuphan.variable} antialiased flex flex-col`}>
        <div className="flex flex-row justify-between">
          <NavBar />
        </div>

        <div className="w-full px-20 pb-10 flex justify-center">{children}</div>
      </body>
    </html>
  );
}
