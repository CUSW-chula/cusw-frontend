'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { setCookie, getCookie } from 'cookies-next';
import { Progress } from '@/components/ui/progress'; // Optional loading spinner

// เช็คจาก URL ปัจจุบันว่าเป็น dev หรือ prod
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const isDev =
      window.location.hostname.includes('dev-cusw') ||
      window.location.hostname.includes('localhost');
    return isDev
      ? 'https://dev-cusw-workspace.sa.chula.ac.th'
      : 'https://cusw-workspace.sa.chula.ac.th';
  }
  // Fallback สำหรับ server-side (ไม่ควรเกิด เพราะเป็น client component)
  return 'https://cusw-workspace.sa.chula.ac.th';
};

const AuthCallbackPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Debug log
  useEffect(() => {
    console.log('[Callback] status:', status);
    console.log('[Callback] session:', session);
  }, [status, session]);

  useEffect(() => {
    const handleTokenExchange = async () => {
      console.log('[Callback] handleTokenExchange called, status:', status);
      if (status === 'authenticated' && session?.user?.email) {
        try {
          const BASE_URL = getBaseURL();
          console.log('[Callback] Fetching token from:', `${BASE_URL}/sign/${session.user.email}`);
          const response = await fetch(`${BASE_URL}/sign/${session.user.email}`);

          if (!response.ok) {
            console.error('[Callback] Token exchange failed:', response.status, response.statusText);
            throw new Error('Token exchange failed');
          }

          const data = await response.text();
          const token = `Bearer ${data}`;
          console.log('[Callback] Token received, setting cookie...');

          // Set cookie with explicit options to ensure it's available for middleware
          // ใช้ document.cookie โดยตรงเพื่อให้แน่ใจว่า cookie ถูก set
          const cookieValue = `auth=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
          document.cookie = cookieValue;
          console.log('[Callback] Cookie set via document.cookie');

          // Also try with cookies-next as backup
          setCookie('auth', token, {
            path: '/',
            secure: window.location.protocol === 'https:',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
          });

          // Verify cookie was set
          await new Promise((res) => setTimeout(res, 100));
          const existing = getCookie('auth');
          console.log('[Callback] Cookie verification:', existing ? 'SUCCESS' : 'FAILED');

          if (!existing) {
            console.error('[Callback] Cookie not set! Check browser cookie settings.');
          }

          // Use window.location for full page reload to ensure cookies are sent
          window.location.href = '/projects';
        } catch (error) {
          console.error('Token exchange error:', error);
          router.push('/contact-admin');
        }
      }
    };

    handleTokenExchange();
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Progress className="h-12 w-12" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    console.log('[Callback] Unauthenticated - redirecting to /login');
    router.push('/login');
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Progress className="h-12 w-12" />
      <p className="ml-4">Processing authentication...</p>
    </div>
  );
};

export default AuthCallbackPage;
