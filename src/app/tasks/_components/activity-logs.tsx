'use client';

import type { TaskProps } from '@/app/types/types';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/use-auth';
import BASE_URL, { BASE_SOCKET } from '@/lib/shared';
import React, { useEffect, useCallback, useState } from 'react';

interface ActivityLogItemProps {
  id: string;
  userId: string;
  taskId: string;
  action: string;
  detail: string;
  createdAt?: string;
}

async function getName(authorId: string, auth: string) {
  try {
    const response = await fetch(`${BASE_URL}/v2/users/${authorId}`, {
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
    return 'Unknown';
  }
}

function formatSentence(sentence: string) {
  const words = sentence.split(' ');
  const elements = [];
  let previousWord = '';
  let previousWordHadUppercase = false;

  for (const word of words) {
    const currentWordHasUppercase = /[A-Z]/.test(word);
    const shouldBold = previousWord.toLowerCase() === 'to' || previousWord.toLowerCase() === 'from';

    // Check if both the previous and current word have uppercase letters, skip if true
    if (previousWordHadUppercase && currentWordHasUppercase) {
      previousWordHadUppercase = currentWordHasUppercase; // Set for the next iteration
      previousWord = word; // Update the previous word
      continue; // Skip this word
    }

    // Add the word with bold styling if it follows "to" or "from"
    elements.push(
      shouldBold ? (
        <b key={`${previousWord}-${word}`}>{word} </b>
      ) : (
        <span key={`${previousWord}-${word}`}>{word} </span>
      ),
    );

    // Update flags and previous word for the next iteration
    previousWordHadUppercase = currentWordHasUppercase;
    previousWord = word;
  }

  return elements;
}

const getInitials = (name: string) => {
  const nameParts = name.split(' ');
  return nameParts.map((part) => part[0]).join('');
};

function formatDate(date?: string): string {
  if (!date) return '';
  const dateObj = new Date(date);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

function ActivityLogItem({ userId, action, detail, createdAt }: ActivityLogItemProps) {
  const [name, setName] = useState('');
  const auth = useAuth();

  useEffect(() => {
    getName(userId, auth).then(setName);
  }, [userId, auth]);

  if (!name) return null;

  return (
    <div className="flex items-center text-black font-BaiJamjuree gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="w-[24px] h-[24px] bg-gray-100 rounded-full text-center flex items-center justify-center border-[1px] border-brown">
              <span className="text-brown text-[12px]">{getInitials(name)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <span>{name}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span>{action.toLowerCase()}</span>
      <span>{formatSentence(detail)}</span>
      <span className="text-gray-500 pl-1 text-sm">{formatDate(createdAt)}</span>
    </div>
  );
}

const ActivityLogs = ({ task }: { task: TaskProps }) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLogItemProps[]>([]);
  const auth = useAuth();

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const parseJsonValue = useCallback((values: any) => {
    const newValue: ActivityLogItemProps = {
      id: values.id ?? '',
      userId: values.userId ?? '',
      taskId: values.taskId ?? '',
      action: values.action ?? '',
      detail: values.detail ?? '',
      createdAt: values.createdAt,
    };
    return newValue;
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      const url = `${BASE_URL}/v2/activities/${task.id}`;
      const options = {
        method: 'GET',
        headers: {
          Authorization: auth,
        },
      };

      try {
        const response = await fetch(url, options);
        const data = await response.json();
        setActivityLogs(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    const ws = new WebSocket(BASE_SOCKET);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      console.log('Message received:', event.data);

      try {
        const socketEvent = JSON.parse(event.data);
        const eventName = socketEvent.eventName;
        const data = parseJsonValue(socketEvent.data);

        setActivityLogs((prevList) =>
          Array.isArray(prevList)
            ? eventName === `activity:${task.id}`
              ? [...prevList, data]
              : prevList.filter((item) => item.id !== data.id)
            : [],
        );
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
    };

    return () => {
      ws.close();
    };
  }, [parseJsonValue, task.id, auth]);

  return (
    <div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2 font-Anuphan">Activity</h3>
      <div className="max-h-48 overflow-y-auto">
        <ul className="flex flex-col gap-2">
          {Array.isArray(activityLogs) && activityLogs.length > 0 ? (
            activityLogs
              .slice()
              .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
              })
              .map((item) => (
                <li key={item.id}>
                  <ActivityLogItem
                    userId={item.userId}
                    action={item.action}
                    detail={item.detail}
                    createdAt={item.createdAt}
                    id={item.id}
                    taskId={item.taskId}
                  />
                </li>
              ))
          ) : (
            <li>No activity logs available.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ActivityLogs;
