'use client';

import { Bai_Jamjuree, Anuphan } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/elements/nav-bar';
import CookieConsentBanner from '@/components/elements/cookie-consent-banner';
import PDPAConsentModal from '@/components/elements/pdpa-consent-modal';
import { SessionProvider } from 'next-auth/react';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const url = usePathname();
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
    // Modal จะจัดการการบันทึกข้อมูลเอง เราแค่รับแจ้งว่าเสร็จแล้ว
  };

  return (
    <html lang="en">
      <SessionProvider>
        <body
          className={`min-h-lvh ${bai_jamjuree.variable} ${anuphan.variable} antialiased flex flex-col`}>
          <CookieConsentBanner />
          <div className="flex flex-row justify-between">{isAllowed && <NavBar />}</div>

          <div className="w-full flex justify-center">{children}</div>
          <Toaster />

          <PDPAConsentModal isOpen={hasPDPAConsent === false} onAccept={handlePDPAAccept} />
        </body>
      </SessionProvider>
    </html>
  );
}
