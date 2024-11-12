import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface ProfileProp {
  userId: string;
  userName: string;
}

const getInitials = (name: string) => {
  const nameParts = name.split(' ');
  return nameParts.map((part) => part[0]).join(''); // Take the first letter of each part
};

export const Profile = ({ userId, userName }: ProfileProp) => {
  return (
    <TooltipProvider>
      <Tooltip key={userId}>
        <TooltipTrigger>
          <div className="flex items-center space-x-2">
            {/* Circle with initials */}
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-slate-900">{getInitials(userName)}</span>
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
