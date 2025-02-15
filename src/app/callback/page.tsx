'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { setCookie } from 'cookies-next';
import { Progress } from '@/components/ui/progress'; // Optional loading spinner

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://cusw-workspace.sa.chula.ac.th'
    : 'http://localhost:4000';

const AuthCallbackPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleTokenExchange = async () => {
      if (status === 'authenticated' && session?.user?.email) {
        try {
          const response = await fetch(`${BASE_URL}/sign/${session.user.email}`);

          if (!response.ok) throw new Error('Token exchange failed');

          const data = await response.text();
          const token = `Bearer ${data}`;

          setCookie('auth', token, {
            secure: process.env.NODE_ENV === 'production',
          });

          router.push('/projects');
        } catch (error) {
          console.error('Token exchange error:', error);
          router.push('/error');
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
