'use client';

import type React from 'react';

// Assuming Task, Project, and User are defined in a types file
import type { Task, Project, User } from '../../types';

// Dummy data for activity logs
const activityLogs: Array<{
  id: number;
  user: string;
  action: string;
  detail: string;
  createdAt: Date;
}> = [
  {
    id: 1,
    user: 'Banyaphon',
    action: 'changed status',
    detail: 'from unassigned to assigned',
    createdAt: new Date(),
  },
  // Add more activity log items as needed
];

interface ActivityLogItemProps {
  user: User;
  action: string;
  detail: string;
  createdAt?: Date;
}

// Reusable component for each activity log item
function ActivityLogItem({ user, action, detail, createdAt }: ActivityLogItemProps) {
  function BoldAfterToFrom(sentence: string) {
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

  function formatDate(date?: Date): string {
    if (!date) return ''; // Return an empty string if no date is provided
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  }

  return (
    <div className="text-m text-gray-800">
      <span className="font-semibold">{user}</span> {action} <span>{BoldAfterToFrom(detail)}</span>
      <span className="text-gray-500"> {formatDate(createdAt)}</span>
    </div>
  );
}

// Main ActivityLogs component
const ActivityLogs: React.FC = () => {
  return (
    <div className="bg-white p-6 space-y-2">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Activity</h3>
      <ul>
        {activityLogs.map((item) => (
          <li key={item.id}>
            <ActivityLogItem
              user={item.user}
              action={item.action}
              detail={item.detail}
              createdAt={item.createdAt}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLogs;
