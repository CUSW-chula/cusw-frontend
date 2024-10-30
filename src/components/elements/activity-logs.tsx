'use client';

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import React from 'react';
import { useEffect } from 'react';

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
    return 'Unknown'; // Handle error gracefully
  }
}

function boldAfterToFrom(sentence: string) {
  const words = sentence.split(' ');
  const elements = [];
  let previousWord = '';

  for (const word of words) {
    if (previousWord === 'to' || previousWord === 'from') {
      elements.push(<b key={word}>{word} </b>);
    } else {
      elements.push(<span key={word}>{word} </span>);
    }
    previousWord = word;
  }

  return elements;
}

// Function to get initials from a full name
const getInitials = (name: string) => {
  const nameParts = name.split(' ');
  return nameParts.map((part) => part[0]).join(''); // Take the first letter of each part
};

function formatDate(date?: string): string {
  const dateObj = date ? new Date(date) : undefined;
  if (!date) return ''; // Return an empty string if no date is provided
  const day = dateObj ? String(dateObj.getDate()).padStart(2, '0') : '';
  const month = dateObj ? String(dateObj.getMonth() + 1).padStart(2, '0') : ''; // Months are 0-based
  const year = dateObj ? dateObj.getFullYear() : '';
  const hours = dateObj ? String(dateObj.getHours()).padStart(2, '0') : '';
  const minutes = dateObj ? String(dateObj.getMinutes()).padStart(2, '0') : '';
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

// Reusable component for each activity log item
function ActivityLogItem({ userId, action, detail, createdAt }: ActivityLogItemProps) {
  const [name, setName] = React.useState('');
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

// Main ActivityLogs component
const ActivityLogs: React.FC = () => {
  const [activityLogs, setActivityLogs] = React.useState<ActivityLogItemProps[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const url = 'http://localhost:4000/api/activities/cm24lq0sx0001jkpdbc9lxu8x';
      const options = { method: 'GET' };
      
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        console.log(data);
        setActivityLogs(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="bg-white space-y-2">
      <h3 className="text-2xl font-semibold text-gray-900 mb-4 font-Anuphan">Activity</h3>
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

