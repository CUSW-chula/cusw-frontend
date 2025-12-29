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

  useEffect(() => {
    const handleTokenExchange = async () => {
      if (status === 'authenticated' && session?.user?.email) {
        try {
          const BASE_URL = getBaseURL();
          const response = await fetch(`${BASE_URL}/sign/${session.user.email}`);

          if (!response.ok) throw new Error('Token exchange failed');

          const data = await response.text();
          const token = `Bearer ${data}`;

          // Set cookie with explicit options to ensure it's available for middleware
          setCookie('auth', token, {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            // Lax allows top-level navigation while still providing CSRF protection
            sameSite: 'lax',
            // Persist for 7 days by default
            maxAge: 60 * 60 * 24 * 7,
          });

          // Ensure cookie is actually set in the browser before navigating.
          // Some browsers or environments may need a tiny delay; retry a few times.
          let retries = 0;
          const maxRetries = 5;
          const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
          while (retries < maxRetries) {
            const existing = getCookie('auth');
            if (existing) {
              break;
            }
            retries += 1;
            // exponential backoff small delays
            // eslint-disable-next-line no-await-in-loop
            await wait(100 * retries);
          }

          router.push('/projects');
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
    router.push('/');
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
