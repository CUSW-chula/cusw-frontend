'use client';

import type { Metadata } from 'next';
import { Bai_Jamjuree, Anuphan } from 'next/font/google';
import '../globals.css';
import { SessionProvider } from 'next-auth/react';
import { Toast } from '@radix-ui/react-toast';
import { Toaster } from '@/components/ui/toaster';

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

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProvider>
        <body
          style={{
            background: 'url("/background2.svg") no-repeat center center fixed',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
          className={`min-h-lvh ${bai_jamjuree.variable} ${anuphan.variable} antialiased flex flex-col w-full justify-center`}>
          {children}
          <Toaster />
        </body>
      </SessionProvider>
    </html>
  );
}
