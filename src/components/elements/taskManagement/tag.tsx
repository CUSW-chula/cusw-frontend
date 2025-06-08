import type React from 'react';
import type { TaskProps } from '@/app/types/types';
import { Badge } from '../../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';

export const Tag = ({
  item,
}: {
  item: TaskProps;
}) => {
  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex w-fit cursor-pointer">
              {item.tags?.length !== 0
                ? item.tags?.slice(0, 3).map((tag, index) => (
                    <Badge
                      key={tag.id}
                      variant="destructive"
                      className="h-6 w-fit bg-[#eefdf7] border border-green flex justify-center transition-transform"
                      style={{
                        marginLeft: `${index * -28}px`,
                      }}>
                      <span className="text-green text-sm font-medium font-BaiJamjuree whitespace-nowrap overflow-hidden text-ellipsis max-w-20">
                        {tag.name}
                      </span>
                    </Badge>
                  ))
                : null}
            </div>
          </TooltipTrigger>
          <TooltipContent className="flex flex-col gap-1">
            {item.tags?.length !== 0
              ? item.tags?.map((tag) => (
                  <div key={tag.id}>
                    <Badge
                      variant="destructive"
                      className="h-6 w-auto bg-[#eefdf7] rounded-xl border border-green ">
                      <span className="text-green text-sm font-medium font-BaiJamjuree leading-normal whitespace-nowrap">
                        {tag.name}
                      </span>
                    </Badge>
                  </div>
                ))
              : null}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
