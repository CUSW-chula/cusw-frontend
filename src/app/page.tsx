'use client';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const cookie = getCookie('auth');
    const auth = cookie?.toString() ?? '';
    const isDev =
      process.env.IS_DEV === 'true' || process.env.IS_DEV === '1' || process.env.IS_DEV === 'yes';
    console.log('IS_DEV:', isDev);
    if (auth !== '') {
      router.push('/projects');
    } else router.push('/login');
  }, [router]);
}
