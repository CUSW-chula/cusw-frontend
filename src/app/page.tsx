'use client';

import { Money } from '@/components/elements/money';
import Workspace from '@/components/elements/workspace';
import { Send } from 'lucide-react';
export default function Home() {
  return (
    <div className="min-w-full min-h-full flex flex-row items-start justify-center mt-10 gap-10">
      <div className="w-[60%] rounded-[6px] p-5 border-brown border-[1px]">
        <Workspace />
        <Send />
      </div>
      <div className="w-[25%] rounded-[6px] p-5 border-brown border-[1px]">
        <Money />
      </div>
    </div>
  );
}
