'use client';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const cookie = getCookie('auth');
    const auth = cookie?.toString() ?? '';

    if (auth !== '') {
      router.push('/projects');
    } else router.push('/login');
  }, [router]);
}
