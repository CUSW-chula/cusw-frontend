'use client';

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';

const Home = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Button onClick={() => signIn('google')}>Sign in with Google v3</Button>
    </div>
  );
};

export default Home;
