'use client';

import { Button } from '@/components/ui/button';
import { signIn, getCsrfToken } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Building, Facebook, Mail, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  // Refresh CSRF token ทุกครั้งที่โหลดหน้า login
  useEffect(() => {
    // Force refresh CSRF token เมื่อเข้าหน้า login
    const refreshCsrf = async () => {
      // ลบ cookies เก่าก่อน
      document.cookie = 'next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      document.cookie = 'next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      
      // Fetch fresh CSRF token
      await getCsrfToken();
    };
    refreshCsrf();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Fetch fresh CSRF อีกครั้งก่อน signin
      await getCsrfToken();
      await signIn('google', { callbackUrl: '/callback' });
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between w-full min-h-screen pt-28 gap-8">
      <Card className="flex flex-row h-[580px] px-32 gap-[40px] items-center justify-center rounded-[20px] border border-brown bg-white">
        {/* Left Section */}
        <div className="flex flex-col items-center">
          <p className="text-lg font-BaiJamjuree text-center">
            ระบบศูนย์ต้นแบบทางด้านสุขภาวะทางจิตระดับอุดมศึกษา
            <br />
            (CUSW+)
          </p>
          <Image src="asset/logo/l1.svg" width={300} height={0} alt="Chula Student Wellness" />
        </div>
        <Separator orientation="vertical" className="h-[240px] bg-gray-300" />
        {/* Right Section */}
        <CardContent className="flex flex-col justify-center items-center space-y-4 p-6">
          <p className="text-lg font-BaiJamjuree">เข้าใช้งาน</p>
          <h1 className="text-6xl font-bold font-Anuphan">Login here</h1>
          <p className="text-lg font-BaiJamjuree">Welcome</p>
          <Button
            variant="outline"
            className="w-fit flex items-center justify-center space-x-2 px-10 border-brown bg-cream"
            onClick={handleGoogleLogin}
            disabled={isLoading}>
            <Image src="asset/icon/google.svg" width={24} height={24} alt="Google Logo" />
            <span className="font-BaiJamjuree">{isLoading ? 'Loading...' : 'Login with Google'}</span>
          </Button>
        </CardContent>
      </Card>

      {/* footer section */}
      <footer className="flex flex-col w-full">
        {/* Top Section: Mental Health Care Supported By */}
        <div className="text-center mb-6">
          <p className="text-2xl font-extrabold font-Anuphan space-x-2">Supported by</p>
          <div className="flex justify-center items-center space-x-8 mt-4">
            {/* Chulalongkorn University Logo and Text */}
            <img
              src="asset/logo/chula.webp"
              alt="Chulalongkorn University Logo"
              width={240}
              height={0}
            />
            <Image
              src="asset/logo/l1.svg"
              alt="Chula Student Wellness Logo"
              width={240}
              height={0}
            />
          </div>
        </div>

        {/* Bottom Section: Copyright, Contact, Social Media */}
        <div className="bg-green w-full mx-auto px-4 py-8 flex flex-row justify-evenly items-start text-white">
          {/* Copyright */}
          <div className="flex flex-col text-start gap-2">
            <p>©2025 All rights reserved | Privacy Policy</p>
          </div>

          {/* Contact Us */}
          <div className="flex flex-col text-start gap-2">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <p className="flex gap-2">
              <Building className="fill-white text-green" />
              Chula Student Wellness Room 311,
              <br />
              3rd Floor, Chamchuri 9 Building
              <br />
              Chulalongkorn University
            </p>
            <p className="flex gap-2 items-center">
              <Phone className="fill-white text-transparent" />
              <a href="tel:085-042-2626">085-042-2626</a>
            </p>
            <p className="flex gap-2 justify-center items-center">
              <Mail className="fill-white text-green" />
              <a href="mailto:chulastudentwellness@gmail.com">chulastudentwellness@gmail.com</a>
            </p>
          </div>

          {/* Social Media */}
          <div className="flex flex-col text-start gap-2">
            <h4 className="text-lg font-semibold">Social Media</h4>
            <p className="flex gap-2 items-center">
              <Facebook />
              <a
                href="https://www.facebook.com/chulastudentwellness"
                target="_blank"
                className="underline hover:text-gray-200"
                rel="noreferrer">
                Chula Student Wellness - CUSW
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
