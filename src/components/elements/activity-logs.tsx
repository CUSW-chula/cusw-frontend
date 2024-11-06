'use client';

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import BASE_URL, { type TaskManageMentProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';
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
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  useEffect(() => {
    getName(userId, auth).then(setName);
  }, [userId, auth]);

  if (!name) return null;

  return (
    <div className="flex items-center space-x-2 text-base text-gray-800 font-BaiJamjuree">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-slate-900">{getInitials(name)}</span>
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

const ActivityLogs = ({ task_id }: TaskManageMentProp) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLogItemProps[]>([]);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

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
      const url = `${BASE_URL}/activities/${task_id}`;
      const options = {
        method: 'GET',
        headers: {
          Authorization: auth,
        },
      };

      try {
        const response = await fetch(url, options);
        const data = await response.json();
        console.log('DD', data);
        setActivityLogs(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    const ws = new WebSocket('ws://localhost:3001');

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
            ? eventName === 'activity'
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
  }, [parseJsonValue, task_id, auth]);

  return (
    <div className="bg-white space-y-2">
      <h3 className="text-2xl font-semibold text-gray-900 mb-4 font-Anuphan">Activity</h3>
      <div className="max-h-48 overflow-y-auto">
        <ul>
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
