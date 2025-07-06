'use client';

import { Bai_Jamjuree, Anuphan } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/elements/nav-bar';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/toaster';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const bai_jamjuree = Bai_Jamjuree({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-bai_jamjuree',
  display: 'swap',
});

const anuphan = Anuphan({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-anuphan',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const url = usePathname();

  // Allowed routes where NavBar should be displayed
  const allowedRoutes = ['/my-tasks', '/projects'];

  // Use useMemo to avoid unnecessary recalculations on fast refresh
  const isAllowed = useMemo(() => {
    return (
      allowedRoutes.includes(url) ||
      url.startsWith('/projects/') ||
      url.startsWith('/tasks/') ||
      url.startsWith('/admin') ||
      url.startsWith('/dashboard')
    );
  }, [url]);

  return (
    <html lang="en">
      <SessionProvider>
        <body
          className={`min-h-lvh ${bai_jamjuree.variable} ${anuphan.variable} antialiased flex flex-col`}>
          <div className="flex flex-row justify-between">{isAllowed && <NavBar />}</div>

          <div className="w-full flex justify-center">{children}</div>
          <Toaster />
        </body>
      </SessionProvider>
    </html>
  );
}
