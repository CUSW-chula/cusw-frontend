'use client';

import { Bai_Jamjuree, Anuphan } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/elements/nav-bar';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/toaster';
import { usePathname } from 'next/navigation';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const url = usePathname();

  return (
    <html lang="en">
      <SessionProvider>
        <body
          className={`min-h-lvh ${bai_jamjuree.variable} ${anuphan.variable} antialiased flex flex-col`}>
          <div className="flex flex-row justify-between">
            {(url !== '/login' && url !== '/contact-admin') ?? <NavBar />}
          </div>

          <div className="w-full flex justify-center">{children}</div>
          <Toaster />
        </body>
      </SessionProvider>
    </html>
  );
}
