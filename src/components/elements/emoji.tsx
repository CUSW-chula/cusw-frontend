'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import dynamic from 'next/dynamic';
import { SmilePlus } from 'lucide-react';
const Picker = dynamic(
  () => {
    return import('emoji-picker-react');
  },
  { ssr: false },
);

const Emoji = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="rounded-full p-2 border-brown border-none">
          <SmilePlus className="text-brown" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit border-none p-0 bg-transparent rounded-[10px]">
        <Picker style={{ fontFamily: 'Baijamjuree' }} />
      </PopoverContent>
    </Popover>
  );
};
export default Emoji;
