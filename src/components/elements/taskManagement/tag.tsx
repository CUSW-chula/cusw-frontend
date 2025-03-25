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
    <div className="relative flex">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild className="cursor-pointer flex max-w-32">
            <div>
              {item.tags?.length !== 0
                ? item.tags?.slice(0, 3).map((tag, index) => (
                    <Badge
                      key={tag.id}
                      variant="destructive"
                      className="h-6 w-auto bg-[#eefdf7] rounded-full border border-green absolute self-center flex justify-center right-0 transition-transform"
                      style={
                        {
                          transform: `translateX(${index * -28}px)`, // Custom CSS property for group hover
                        } as React.CSSProperties
                      }>
                      <span className="text-green text-sm font-medium font-BaiJamjuree leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
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
