'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import React, { useEffect, useCallback, useState } from 'react';

interface ActivityLogItemProps {
  id: string;
  userId: string;
  taskId: string;
  action: string;
  detail: string;
  createdAt?: string;
}

async function getName(authorId: string) {
  try {
    const response = await fetch(`http://localhost:4000/api/users/${authorId}`);
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

function boldAfterToFrom(sentence: string) {
  const words = sentence.split(' ');
  const elements = [];
  let previousWord = '';

  for (const word of words) {
    const isBold = previousWord === 'to' || previousWord === 'from';
    const key = `${previousWord}-${word}`; // Create a unique key based on neighboring words

    elements.push(
      isBold ? <b key={key}>{word} </b> : <span key={key}>{word} </span>
    );
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

function ActivityLogItem({
  userId,
  action,
  detail,
  createdAt,
}: ActivityLogItemProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    getName(userId).then(setName);
  }, [userId]);

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
      <span>{action}</span>
      <span>{boldAfterToFrom(detail)}</span>
      <span className="text-gray-500 pl-1 text-sm">{formatDate(createdAt)}</span>
    </div>
  );
}

const ActivityLogs: React.FC = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLogItemProps[]>([]);

  const pareJsonValue = useCallback((values: any): ActivityLogItemProps => {
    return {
      id: values.id,
      userId: values.userId,
      taskId: values.taskId,
      action: values.action,
      detail: values.detail,
      createdAt: values.createdAt,
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'http://localhost:4000/api/activities/cm24lq0sx0001jkpdbc9lxu8x'
        );
        const data = await response.json();
        setActivityLogs(data);
      } catch (error) {
        console.error('Failed to fetch activity logs:', error);
      }
    };

    fetchData();

    const ws = new WebSocket('ws://localhost:3001');

    ws.onmessage = (event: MessageEvent) => {
      try {
        const socketEvent = JSON.parse(event.data);
        const eventName = socketEvent.eventName;
        const data = pareJsonValue(socketEvent.data);

        if (eventName === 'activity-log') {
          setActivityLogs((prev) => [...prev, data]);
        } else if (eventName === 'delete-activity-log') {
          setActivityLogs((prev) => prev.filter((log) => log.id !== data.id));
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
    };

    return () => {
      ws.close();
      ws.onmessage = null;
    };
  }, [pareJsonValue]);

  return (
    <div className="bg-white space-y-2">
      <h3 className="text-2xl font-semibold text-gray-900 mb-4 font-Anuphan">
        Activity
      </h3>
      <div className="max-h-48 overflow-y-auto">
        <ul>
          {activityLogs.map((item) => (
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
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ActivityLogs;
