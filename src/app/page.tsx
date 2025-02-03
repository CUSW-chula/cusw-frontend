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
    const url = `${BASE_URL}/sign/cm0siagz300003mbv5bsz6wty`;
    const options = { method: 'GET' };
    try {
      const response = await fetch(url, options);
      const data = await response.text();
      const token = `Bearer ${data}`;
      setCookie('auth', token);
      router.push('/projects');
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Button onClick={handleSignIn}>Sign in with Google</Button>
    </div>
  );
};

export default Home;
