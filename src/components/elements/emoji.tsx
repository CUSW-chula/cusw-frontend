'use client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import dynamic from 'next/dynamic';
import { SmilePlus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { EmojiClickData } from 'emoji-picker-react';
import type { TaskManageMentProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import BASE_URL, { BASE_SOCKET } from '@/lib/shared';

const Picker = dynamic(
  () => {
    return import('emoji-picker-react');
  },
  { ssr: true },
);

interface EmojiTaskUser {
  id: string;
  emoji: string;
  userId: string;
  taskId: string;
}
async function getName(authorId: string, auth: string) {
  try {
    const response = await fetch(`${BASE_URL}/users/${authorId}`, {
      headers: {
        Authorization: auth,
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.name;
  } catch (error) {
    console.error('Failed to fetch user name:', error);
    return 'Unknown'; // Handle error gracefully
  }
}
function EmojiUser({ emoji, id, userId }: EmojiTaskUser) {
  const [name, setName] = useState('');
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  useEffect(() => {
    getName(userId, auth).then(setName);
  }, [userId, auth]);
  return (
    <div key={id} className="flex py-1 justify-between">
      <p className="body self-center">{name}</p>
      <p className="text-[24px]">{emoji}</p>
    </div>
  );
}
const Emoji = ({ task_id }: TaskManageMentProp) => {
  const [emojis, setEmojis] = React.useState<EmojiTaskUser[]>([]);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  const pareJsonValue = React.useCallback((values: EmojiTaskUser) => {
    return {
      id: values.id,
      emoji: values.emoji,
      userId: values.userId,
      taskId: values.taskId,
    };
  }, []);

  React.useEffect(() => {
    const getEmoji = async () => {
      const url = `${BASE_URL}/tasks/emoji/${task_id}`;
      const options = {
        method: 'GET',
        headers: {
          Authorization: auth,
        },
      };
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        setEmojis(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setEmojis([]); // Ensure emojis is empty on error
      }
    };

    getEmoji();

    const ws = new WebSocket(BASE_SOCKET);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      console.log('Message received:', event.data);

      try {
        const socketEvent = JSON.parse(event.data);
        const eventName = socketEvent.eventName;
        const newEmoji = pareJsonValue(socketEvent.data);

        setEmojis((prevEmojis) => {
          if (eventName === 'addEmoji') {
            return [newEmoji, ...prevEmojis];
          }
          return prevEmojis.map((prevEmoji) =>
            prevEmoji.id === newEmoji.id ? newEmoji : prevEmoji,
          );
        });
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
  }, [pareJsonValue, auth, task_id]);

  const handleEmojiActions = async (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const taskId = task_id;
    const userId = 'cm0siagz300003mbv5bsz6wty';
    const url = `${BASE_URL}/tasks/emoji`;
    const checkResponse = await fetch(`${url}/${taskId}/${userId}`, {
      headers: {
        Authorization: auth,
      },
    });
    const isEmojiAssigned = await checkResponse.json();
    const options = {
      method: isEmojiAssigned ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({
        taskId: taskId,
        userId: userId,
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
              {sortedEmojis.map((emojiData) => (
                <EmojiUser
                  emoji={emojiData.emoji}
                  id={emojiData.id}
                  userId={emojiData.userId}
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
