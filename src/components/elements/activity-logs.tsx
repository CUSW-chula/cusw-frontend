import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import type React from 'react';

// Dummy data for activity logs
const activityLogs: Array<ActivityLogItemProps> = [
  {
    id: 'cm2w5lj0w0001x1896b6flbdz',
    userId: 'Banyaphon Kongtham',
    taskId: 'cm2w5w0z90003x189bhledv9q',
    action: 'created',
    detail: '"Design a new logo"',
    createdAt: new Date(),
  },

  // Add more activity log items as needed
];

interface ActivityLogItemProps {
  id: string;
  userId: string;
  taskId: string;
  action: string;
  detail: string;
  createdAt?: Date;
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

function formatDate(date?: Date): string {
  if (!date) return ''; // Return an empty string if no date is provided
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

// Reusable component for each activity log item
function ActivityLogItem({ userId, action, detail, createdAt }: ActivityLogItemProps) {
  return (
    <div className="flex items-center space-x-2 text-base text-gray-800 font-BaiJamjuree">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-slate-900">{getInitials(userId)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <span>{userId}</span>
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
