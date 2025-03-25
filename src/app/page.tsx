'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';

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
