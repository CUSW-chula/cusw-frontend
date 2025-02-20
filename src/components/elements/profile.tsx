import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

import { Skeleton } from '@/components/ui/skeleton';
import type React from 'react';

interface ProfileProp {
  userId: string;
  userName?: string; // Made optional to handle loading states
  fallback?: React.ReactNode;
}

const getInitials = (name?: string) => {
  if (!name) return '';
  const nameParts = name.split(' ');
  return nameParts.map((part) => part[0]).join('');
};

export const Profile = ({ userId, userName, fallback }: ProfileProp) => {
  // Show fallback if no username provided
  if (!userName) {
    return (
      <div className="flex items-center space-x-2 border-brown text-brown">
        {fallback || <Skeleton className="w-[24px] h-[24px] rounded-full" />}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2 border-brown text-brown">
            <div className="w-[24px] h-[24px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
              <span className="text-brown text-[12px] font-BaiJamjuree">
                {getInitials(userName)}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <span>{userName}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const Profile2 = ({ userId, userName }: ProfileProp) => {
  return (
    <TooltipProvider>
      <Tooltip key={userId}>
        <TooltipTrigger>
          <div className="flex items-center space-x-2  border-brown text-brown ">
            {/* Circle with initials */}
            <div className="w-[40px] h-[40px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
              <span className="  text-brown text-[16px] font-BaiJamjuree">
                {getInitials(userName)}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        {/* Tooltip content showing the full name */}
        <TooltipContent>
          <span>{userName}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
