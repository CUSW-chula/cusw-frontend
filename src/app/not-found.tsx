'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      window.location.href = '/';
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-brown">
      {/* 404 */}
      <h1 className="text-6xl font-bold text-red-500 animate-bounce">404</h1>

      {/* notification */}
      <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
      <p className="mt-2 text-gray-600">Could not find the requested resource.</p>

      {/* Timer Redirect */}
      <p className="mt-2 text-gray-500 text-sm">
        Redirecting in <span className="font-bold text-red-500">{countdown}</span> seconds...
      </p>

      {/* home button */}
      <Link href={'/'} passHref>
        <Button className="mt-4 bg-brown">Back to Home</Button>
      </Link>
    </div>
  );
}
