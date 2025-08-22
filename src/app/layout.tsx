'use client';

import { Bai_Jamjuree, Anuphan } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/elements/nav-bar';
import CookieConsentBanner from '@/components/elements/cookie-consent-banner';
import PDPAConsentModal from '@/components/elements/pdpa-consent-modal';
import { SessionProvider, useSession } from 'next-auth/react';
import { Toaster } from '@/components/ui/toaster';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { usePDPAConsent } from '@/hooks/use-pdpa-consent';

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

function RootLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const url = usePathname();
  const { data: session, status } = useSession();
  const { hasPDPAConsent } = usePDPAConsent();

  // Allowed routes where NavBar should be displayed
  const allowedRoutes = ['/my-tasks', '/projects'];

  // Use useMemo to avoid unnecessary recalculations on fast refresh
  const isAllowed = useMemo(() => {
    return (
      allowedRoutes.includes(url) ||
      url.startsWith('/projects/') ||
      url.startsWith('/tasks/') ||
      url.startsWith('/admin') ||
      url.startsWith('/dashboard') ||
      url.startsWith('/workload')
    );
  }, [url]);

  const handlePDPAAccept = () => {
    console.log('PDPA consent completed');
  };

  const shouldShowPDPA = session && hasPDPAConsent === false && !url.startsWith('/login');

  return (
    <body
      className={`min-h-lvh ${bai_jamjuree.variable} ${anuphan.variable} antialiased flex flex-col`}>
      <CookieConsentBanner />
      <div className="flex flex-row justify-between">{isAllowed && <NavBar />}</div>

      <div className="w-full flex justify-center">{children}</div>
      <Toaster />

      {/* {shouldShowPDPA && <PDPAConsentModal isOpen={true} onAccept={handlePDPAAccept} />} */}
    </body>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProvider>
        <RootLayoutContent>{children}</RootLayoutContent>
      </SessionProvider>
    </html>
  );
}
