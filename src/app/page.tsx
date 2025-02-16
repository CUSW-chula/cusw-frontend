'use client';

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { useEffect } from 'react';

const Home = () => {
  useEffect(() => {
    console.log('Home rendered', process.env.NEXTAUTH_SECRET);
  }, []);
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Button onClick={() => signIn('google')}>Sign in with Google v2</Button>
    </div>
  );
};

export default Home;
