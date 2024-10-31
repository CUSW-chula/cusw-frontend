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
interface EmojiTaskUser {
  id: string;
  emoji: string;
  userId: string;
  taskId: string;
}

const Emoji = () => {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [isEmojiAdded, setIsEmojiAdded] = useState<boolean>(false); // State to track if emoji has been added
  const [emojis, setEmojis] = React.useState<EmojiTaskUser[]>([]);

  const pareJsonValue = React.useCallback((values: EmojiTaskUser) => {
    const newValue: EmojiTaskUser = {
      id: values.id,
      emoji: values.emoji,
      userId: values.userId,
      taskId: values.taskId,
    };
    return newValue;
  }, []);

  React.useEffect(() => {
    const getEmoji = async () => {
      const url = 'http://localhost:4000/api/tasks/emoji/cm24lq0sx0001jkpdbc9lxu8x';
      const options = { method: 'GET' };
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        setEmojis(data);
        console.log(data);
        if (Array.isArray(data)) {
          setEmojis(data);
        } else {
          console.error('Expected an array from the API:', data);
          setEmojis([]); // Reset to an empty array if the response is not as expected
        }
      } catch (error) {
        console.error(error);
        setEmojis([]); // Ensure emojis is empty on error
      }
    };

    getEmoji();

    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      console.log('Message received:', event.data);

      try {
        const socketEvent = JSON.parse(event.data);
        const eventName = socketEvent.eventName;
        const data = pareJsonValue(socketEvent.data);
        if (eventName === 'addEmoji') {
          const newEmoji = pareJsonValue(socketEvent.data);
          setEmojis((prevEmojis) => [newEmoji, ...prevEmojis]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, [pareJsonValue]);

  const handleEmojiActions = async (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    setSelectedEmoji(emoji);
    const url = 'http://localhost:4000/api/tasks/emoji/';
    const options = {
      method: isEmojiAdded ? 'POST' : 'POST', // Use PATCH if emoji is already added
      headers: { 'Content-Type': 'application/json' },
      body: isEmojiAdded
        ? JSON.stringify({
            taskId: 'cm24lq0sx0001jkpdbc9lxu8x',
            userId: 'cm24ll4370008kh59coznldal',
            emoji: emoji,
            //Id: "",
          })
        : JSON.stringify({
            taskId: 'cm24lq0sx0001jkpdbc9lxu8x',
            userId: 'cm24ll4370008kh59coznldal',
            emoji: emoji,
          }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!isEmojiAdded) {
        setIsEmojiAdded(true);
        console.log('Emoji assigned successfully:', emoji);
      } else {
        console.log('Emoji updated successfully:', data);
      }
    } catch (error) {
      console.error(isEmojiAdded ? 'Error updating emoji:' : 'Error assigning emoji:', error);
    }
  };
  const sortedEmojis = [...emojis].sort((a, b) => b.id.localeCompare(a.id));
  return (
    <div className="flex texts-center justify-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="rounded-full p-2 border-brown border-none">
            <SmilePlus className="text-brown" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit border-none p-0 bg-transparent rounded-[10px]">
          <Picker onEmojiClick={handleEmojiActions} searchDisabled />
        </PopoverContent>
      </Popover>
      <div className="rounded-full flex justify-center text-center items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="rounded-full min-w-[20px] w-fit h-[32px] border-brown border-none">
              <ul>
                {sortedEmojis.slice(0, 8).map((emojiData) => (
                  <span key={emojiData.id} className="text-[16px]">
                    {emojiData.emoji}
                  </span>
                ))}
              </ul>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="min-w-[240px] w-fit max-h-80 overflow-y-scroll">
            <ul>
              {emojis.map((emojiData) => (
                <div key={emojiData.id} className="flex py-1 justify-between">
                  <p className="body self-center">Banyaphon Kongtham</p>
                  <p className="text-[24px]">{emojiData.emoji}</p>
                </div>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default Emoji;
