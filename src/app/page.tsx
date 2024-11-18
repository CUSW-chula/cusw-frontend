'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://cusw-workspace.sa.chula.ac.th'
    : 'http://localhost:4000';

const Home = () => {
  const router = useRouter();
  const handleSignIn = async () => {
    const url = `${BASE_URL}/sign/z`;
    const options = { method: 'GET' };
    try {
      const response = await fetch(url, options);
      const data = await response.text();
      const token = `Bearer ${data}`;
      setCookie('auth', token);
      router.push('/projects/cm24w5yu000008tlglutu5czu');
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Button onClick={handleSignIn} className="flex items-center gap-2">
        Sign in with Google
      </Button>
    </div>
  );
};

export default Home;
