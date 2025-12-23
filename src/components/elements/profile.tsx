import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import type React from 'react';
import { useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next/client';

export interface ProfileProp {
  userId: string;
  userName?: string; // Made optional to handle loading states
  email?: string; // Optional email prop
  organization?: string; // Optional organization prop
  position?: string; // Optional position prop
  isOutsourced?: boolean; // Optional isOutsourced prop
  isAdmin?: boolean;
  isHead?: boolean;
  fallback?: React.ReactNode;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const parseProfileJsonValues = (data: any): ProfileProp => {
  const json: ProfileProp = {
    userId: data.id,
    userName: data.name ?? '',
    email: data.email ?? '',
    organization: data.organization ?? '',
    position: data.position ?? '',
    isOutsourced: data.isOutsource ?? false,
    isAdmin: data.admin ?? false,
    isHead: data.head ?? false,
    fallback: <span>Loading...</span>, // or keep existing fallback
  };
  return json;
};

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

export const Profile2 = ({ profile }: { profile: ProfileProp }) => {
  const navigate = useRouter();

  const handleSignOut = async () => {
    deleteCookie('auth');
    localStorage.clear();
    navigate.push('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center space-x-2 border-brown text-brown cursor-pointer">
          <div className="w-[40px] h-[40px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown hover:bg-gray-200 transition-colors">
            <span className="text-brown text-[16px] font-BaiJamjuree">
              {getInitials(profile.userName)}
            </span>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px] p-2">
        <DropdownMenuLabel className="text-black text-[18px] font-semibold font-BaiJamjuree px-2">
          {profile.userName}
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {profile.isAdmin && (
            <DropdownMenuItem
              onClick={() => window.location.assign('/admin')}
              className="text-black font-BaiJamjuree">
              Admin
            </DropdownMenuItem>
          )}
          {(profile.isHead || profile.isAdmin || !profile.isOutsourced) && (
            <DropdownMenuItem
              onClick={() => window.location.assign('/dashboards')}
              className="text-black font-BaiJamjuree">
              Dashboard
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <hr className="px-2 w-full border-t-1 border-gray-200" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red font-semibold font-BaiJamjuree mt-1 focus:text-red">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
