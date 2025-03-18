'use client';

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="flex flex-row h-[580px] px-32 gap-[40px] items-center justify-center rounded-[20px] border border-brown bg-white shadow-[15px_10.714px_32.357px_0px_rgba(0,0,0,0.25)]">
        {/* Left Section */}
        <Image src="asset/logo/Logo_l1.svg" width={300} height={0} alt="Chula Student Wellness" />
        <Separator orientation="vertical" className="h-[200px] bg-gray-300" />
        {/* Right Section */}
        <CardContent className="flex flex-col justify-center items-center space-y-5 p-6">
          <h1 className="text-6xl font-bold font-Anuphan">Login here</h1>
          <p className="text-lg font-BaiJamjuree">Welcome!!!</p>
          <Button
            variant="outline"
            className="w-fit flex items-center justify-center space-x-2 px-10 border-brown bg-cream"
            onClick={() => signIn('google')}>
            <Image src="asset/icon/google.svg" width={24} height={24} alt="Google Logo" />
            <span className="font-BaiJamjuree">Login with Google</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
