'use client';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Contact = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-brown">
      {/* Icon */}
      <AlertCircle width={50} height={50} className="text-red animate-bounce" />

      {/* Title */}
      <h2 className="text-2xl font-semibold mt-4">Access Denied</h2>

      {/* Message */}
      <p className="mt-2 text-gray-600 text-center">
        Please use a registered email or contact the <br />
        <span className="font-semibold">CUSW Workspace Admin</span> for support.
      </p>

      {/* Home Button */}
      <Link href="/" passHref>
        <Button className="mt-4 bg-brown">Back to login</Button>
      </Link>
    </div>
  );
};

export default Contact;
