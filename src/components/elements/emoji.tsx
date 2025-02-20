'use client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import dynamic from 'next/dynamic';
import { SmilePlus } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import type { EmojiClickData } from 'emoji-picker-react';
import { getCookie } from 'cookies-next';
import BASE_URL, { BASE_SOCKET, type Emojis } from '@/lib/shared';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import type { TaskProps } from '@/app/types/types';

const Picker = dynamic(() => import('emoji-picker-react'), { ssr: true });

interface CustomJwtPayload extends JwtPayload {
  id: string;
}

interface EmojiTaskUser {
  id: string;
  emoji: string;
  userId: string;
  name: string;
  taskId: string;
}

const Emoji = ({ task }: { task: TaskProps }) => {
  const [emojis, setEmojis] = useState<Emojis[]>([]);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const task_id = task.id;

  useEffect(() => {
    setEmojis(task.emojis);
  }, [task.emojis]);

  const pareJsonValue = useCallback((values: EmojiTaskUser) => {
    return {
      id: values.id,
      emoji: values.emoji,
      userId: values.userId,
      taskId: values.taskId,
    };
  }, []);

  async function getName(authorId: string) {
    try {
      const response = await fetch(`${BASE_URL}/v1/users/${authorId}`, {
        headers: { Authorization: auth },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.name;
    } catch (error) {
      console.error('Failed to fetch user name:', error);
      return 'Unknown';
    }
  }

  const EmojiUser = ({ emoji, id, userId }: EmojiTaskUser) => {
    const [userName, setUserName] = useState<string>('Loading...');

    useEffect(() => {
      const fetchUserName = async () => {
        const name = await getName(userId);
        setUserName(name);
      };
      fetchUserName();
    }, [userId]);

    return (
      <div key={id} className="flex py-1 justify-between">
        <p className="body self-center">{userName}</p>
        <p className="text-[24px]">{emoji}</p>
      </div>
    );
  };

  useEffect(() => {
    const ws = new WebSocket(BASE_SOCKET);
    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };
    ws.onmessage = async (event) => {
      console.log('Message received:', event.data);
      try {
        const socketEvent = JSON.parse(event.data);
        const newEmoji = pareJsonValue(socketEvent.data);
        const updatedEmoji = {
          id: newEmoji.id,
          emoji: newEmoji.emoji,
          user: { id: newEmoji.userId, email: '', name: await getName(newEmoji.userId) },
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
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    return () => {
      ws.close();
    };
  }, [pareJsonValue]);

  const handleEmojiActions = async (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const taskId = task_id;
    const getUserDataFromCookie = () => {
      const decoded = jwtDecode<CustomJwtPayload>(auth);
      return decoded;
    };
    const userData = getUserDataFromCookie();
    const url = `${BASE_URL}/v1/tasks/emoji`;

    const checkResponse = await fetch(`${BASE_URL}/v1/tasks/emoji/${taskId}/${userData.id}`, {
      headers: { Authorization: auth },
    });

    const isEmojiAssigned = await checkResponse.json();
    const options = {
      method: isEmojiAssigned ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({
        taskId: taskId,
        userId: userData.id,
        emoji: emoji,
      }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(
        isEmojiAssigned ? 'Emoji updated successfully:' : 'Emoji assigned successfully:',
        data,
      );
    } catch (error) {
      console.error(isEmojiAssigned ? 'Error updating emoji:' : 'Error assigning emoji:', error);
    }
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
                  userId={emojiData.user.id}
                  taskId={emojiData.taskId}
                  key={emojiData.id}
                  name={''}
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
