import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import type React from 'react';
import { useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next/client';

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

export const Profile = ({ userId, userName }: ProfileProp) => {
  // Show fallback if no username provided
  if (!userName) {
    return (
      <div className="flex items-center space-x-2 border-brown text-brown">
        {/* Fallback content can be added here if needed */}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip key={userId}>
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
  const navigate = useRouter();

  const handleSignOut = async () => {
    deleteCookie('auth');
    navigate.push('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center space-x-2 border-brown text-brown cursor-pointer">
          <div className="w-[40px] h-[40px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown hover:bg-gray-200 transition-colors">
            <span className="text-brown text-[16px] font-BaiJamjuree">{getInitials(userName)}</span>
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[200px] p-2">
        <div className="flex flex-col space-y-2">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
          </div>
          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50">
            Sign Out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
