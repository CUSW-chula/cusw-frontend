import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { User } from 'lucide-react';
import type { TaskProps } from '@/app/types/types';

export const Assigned = ({
  item,
}: {
  item: TaskProps;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <User className="h-8 w-8 p-1 text-brown border border-brown rounded-full hover:cursor-pointer" />
        </TooltipTrigger>
        <TooltipContent>
          {item.members?.length !== 0 ? (
            item.members?.map((user) => (
              <div key={user.id} className="flex items-center gap-2">
                <span>{user.name}</span>
              </div>
            ))
          ) : (
            <span>No one assigned</span>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
