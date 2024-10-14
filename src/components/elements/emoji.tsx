'use client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import dynamic from 'next/dynamic';
import { SmilePlus } from 'lucide-react';
import React, { useState } from 'react';
import type { EmojiClickData } from 'emoji-picker-react';

const Picker = dynamic(
  () => {
    return import('emoji-picker-react');
  },
  { ssr: false },
);

const Emoji = () => {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setSelectedEmoji(emojiData.emoji);
  };

  return (
    <div className="flex texts-center justify-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="rounded-full p-2 border-brown border-none">
            <SmilePlus className="text-brown" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit border-none p-0 bg-transparent rounded-[10px]">
          <Picker onEmojiClick={handleEmojiClick} searchDisabled />
        </PopoverContent>
      </Popover>
      {selectedEmoji && (
        <div className="bg-gray-100 rounded-full flex justify-center items-center text-center min-w-10 w-fit h-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-full p-2 border-brown border-none">
                <span className="text-[24px]">{selectedEmoji}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="">
              <div className="flex justify-between">
                <p className="body self-center">Banyaphon Kogntham</p>
                <p className="text-[24px]"> {selectedEmoji}</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default Emoji;
