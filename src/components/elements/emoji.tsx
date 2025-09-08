'use client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import dynamic from 'next/dynamic';
import { SmilePlus } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import type { EmojiClickData } from 'emoji-picker-react';
import { getCookie } from 'cookies-next';
import BASE_URL, { BASE_SOCKET, type User, type Emojis } from '@/lib/shared';
import { jwtDecode } from 'jwt-decode';
import type { TaskProps } from '@/app/types/types';
import { toast } from '@/hooks/use-toast';

const Picker = dynamic(() => import('emoji-picker-react'), { ssr: true, loading:()=>null });

interface EmojiTaskUser {
  id: string;
  emoji: string;
  user: User;
  taskId: string;
}

const Emoji = ({ task }: { task: TaskProps }) => {
  const [emojis, setEmojis] = useState<Emojis[]>([]);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const task_id = task.id;
  const userid = (jwtDecode(auth) as { id: string }).id;

  useEffect(() => {
    setEmojis(task.emojis);
  }, [task.emojis]);

  const pareJsonValue = useCallback((values: EmojiTaskUser) => {
    return {
      id: values.id,
      emoji: values.emoji,
      user: values.user,
      taskId: values.taskId,
    };
  }, []);

  const EmojiUser = ({ emoji, id, user }: EmojiTaskUser) => {
    return (
      <div key={id} className="flex py-1 justify-between">
        <p className="body self-center">{user.name}</p>
        <p className="text-[24px]">{emoji}</p>
      </div>
    );
  };

  useEffect(() => {
    const ws = new WebSocket(BASE_SOCKET);
    ws.onopen = () => {};
    ws.onmessage = async (event) => {
      try {
        const socketEvent = JSON.parse(event.data);
        const newEmoji = pareJsonValue(socketEvent.data);
        const updatedEmoji = {
          id: newEmoji.id,
          emoji: newEmoji.emoji,
          user: newEmoji.user,
          taskId: newEmoji.taskId,
        };

        setEmojis((prevEmojis) => {
          if (socketEvent.eventName === 'addEmoji') {
            return [updatedEmoji, ...prevEmojis];
          }
          return prevEmojis.map((prevEmoji) =>
            prevEmoji.id === updatedEmoji.id ? updatedEmoji : prevEmoji,
          );
        });
      } catch (error) {}
    };

    return () => {
      ws.close();
    };
  }, [pareJsonValue]);

  const handleEmojiActions = async (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const taskId = task_id;
    const url = `${BASE_URL}/v2/tasks/emoji/${taskId}`;

    const checkResponse = await fetch(`${BASE_URL}/v2/tasks/emoji/${taskId}`, {
      headers: { Authorization: auth },
    });
    if (!checkResponse.ok) {
      const errorMessage = await checkResponse.text();
    }

    const isEmojiAssigned = await checkResponse.json();
    const options = {
      method: isEmojiAssigned ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({
        userId: userid,
        emoji: emoji,
      }),
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorMessage = await response.text();
      }
    } catch (error) {}
  };

  const sortedEmojis = [...emojis].sort((a, b) => b.id.localeCompare(a.id));

  return (
    <div className="flex texts-center justify-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="rounded-full p-2 border-none">
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
              className="rounded-full min-w-[20px] w-fit h-[32px] border-none">
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
              {sortedEmojis.map((emojiData) => (
                <EmojiUser
                  emoji={emojiData.emoji}
                  id={emojiData.id}
                  user={emojiData.user}
                  taskId={emojiData.taskId}
                  key={emojiData.id}
                />
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default Emoji;
