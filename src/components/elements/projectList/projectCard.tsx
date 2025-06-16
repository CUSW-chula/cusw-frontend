'use client';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip';
import { DateText } from '../date-feature';
import { Calendar, CrownIcon, Star, Tag, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/shared';
import { SortDefault, UsePinned } from './sort-pin-project';
import Link from 'next/link';
interface ProjectProps {
  query: Project[];
  setQuery: (prev: Project[]) => void;
  projectList: Project[];
  setProjectList: (prev: Project[]) => void;
  starredProjects: Record<string, boolean>;
  setStarredProjects: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const ProjectCard = ({
  query,
  setQuery,
  projectList,
  setProjectList,
  starredProjects,
  setStarredProjects,
}: ProjectProps) => {
  const { toggleStar } = UsePinned(starredProjects, setStarredProjects);
  //get initials name
  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    return nameParts.map((part) => part[0]).join(''); // Take the first letter of each part
  };

  return (
    <>
      <div
        className={
          query.length > 0
            ? 'grid grid-cols-[repeat(auto-fill,minmax(308px,308px))] justify-center gap-4 w-full'
            : 'flex items-center justify-center w-full'
        }>
        {query.length > 0 ? (
          query.map((project, index) => (
            <div key={`${project.id}-${index}`} className="relative">
              <div className="absolute top-[15px] right-[20px] z-50">
                <button type="button" onClick={() => toggleStar(project.id)}>
                  {starredProjects[project.id] ? (
                    <Star className="text-brown h-[24px] w-[24px] fill-yellow" />
                  ) : (
                    <Star className="text-brown h-[24px] w-[24px]" />
                  )}
                </button>
              </div>
              <Link
                href={`/projects/detail/${project.id}`}
                className="flex flex-start w-[308px] h-[348px] p-[18px] gap-[10px] bg-white border-[1px] border-brown rounded-[6px] ">
                <div className="flex flex-col gap-y-[8px]">
                  <div className="h-[40px] w-[240px] self-stretch overflow-hidden">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="font-BaiJamjuree text-[16px] text-base font-medium leading-[1.75] text-ellipsis truncate w-full">
                            {project.title}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          className="bg-white z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" // Added styling
                        >
                          <p>{project.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="flex flex-row items-center">
                    <CrownIcon className="w-6 h-6 text-black mr-1" />
                    <TooltipProvider>
                      <div className="flex items-center space-x-1">
                        {project.owner?.slice(0, 3).map((user) => (
                          <Tooltip key={user?.id ?? user?.email}>
                            <TooltipTrigger>
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center border border-brown">
                                <span className="text-brown text-xs font-BaiJamjuree">
                                  {getInitials(user?.name || '')}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="bg-white z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md">
                                {user?.name}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </TooltipProvider>
                    {project.owner && project.owner.length > 3 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="ml-1 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center border border-brown">
                              <span className="text-brown text-xs font-BaiJamjuree">
                                +{project.owner.length - 3}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="z-50 overflow-hidden rounded-md border bg-white px-3 py-2 shadow-md">
                            <div className="flex flex-col flex-wrap items-start gap-1">
                              {project.owner?.map((own) => (
                                <span
                                  key={own?.id}
                                  className="text-xs font-medium font-BaiJamjuree text-black">
                                  {own?.name}
                                </span>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  <div className="flex flex-row items-center">
                    <Users className="w-6 h-6 text-black mr-1" />
                    <TooltipProvider>
                      <div className="flex items-center space-x-1">
                        {project.members?.slice(0, 3).map((user) => (
                          <Tooltip key={user?.id ?? user?.email}>
                            <TooltipTrigger>
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center border border-brown">
                                <span className="text-brown text-xs font-BaiJamjuree">
                                  {getInitials(user?.name || '')}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="bg-white z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md">
                                {user?.name}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </TooltipProvider>
                    {project.members && project.members.length > 3 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="ml-1 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center border border-brown">
                              <span className="text-brown text-xs font-BaiJamjuree">
                                +{project.members.length - 3}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="z-50 overflow-hidden rounded-md border bg-white px-3 py-2 shadow-md">
                            <div className="flex flex-col flex-wrap items-start gap-1">
                              {project.members?.map((mem) => (
                                <span
                                  key={mem?.id}
                                  className="text-xs font-medium font-BaiJamjuree text-black">
                                  {mem?.name}
                                </span>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  <TooltipProvider>
                    <div className="flex flex-row items-center">
                      <div className="flex items-center justify-center font-BaiJamjuree text-[24px] w-6 h-6 font-semibold -ml-1">
                        ฿
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="font-BaiJamjuree text-[14px] font-medium ml-2 truncate max-w-[250px]">
                            {project.budget.toLocaleString()}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          align="center"
                          className="z-50 overflow-visible ">
                          <p className="z-50 font-BaiJamjuree font-medium bg-white border border-gray-300 rounded-md px-2 py-1 text-sm">
                            {project.budget.toLocaleString()}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                  <TooltipProvider>
                    <div className="flex flex-row items-center">
                      <div className="flex items-center justify-center font-BaiJamjuree text-[24px] w-6 h-6 font-semibold -ml-1 text-[#EF4444] ">
                        ฿
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="font-BaiJamjuree text-[14px] font-medium ml-2 truncate max-w-[250px] text-[#EF4444] ">
                            {project.expense.toLocaleString()}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          align="center"
                          className="z-50 overflow-visible ">
                          <p className="z-50 font-BaiJamjuree font-medium bg-white border border-gray-300 rounded-md px-2 py-1 text-sm text-[#EF4444] ">
                            {project.expense.toLocaleString()}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>

                  <TooltipProvider>
                    <div className="flex flex-row items-center">
                      <div className="flex items-center justify-center font-BaiJamjuree text-[24px] w-6 h-6 font-semibold -ml-1 text-[#69BCA0]">
                        ฿
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="font-BaiJamjuree text-[14px] font-medium ml-2 truncate max-w-[250px] text-[#69BCA0]">
                            {project.advance.toLocaleString()}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          align="center"
                          className="z-50 overflow-visible ">
                          <p className="z-50 font-BaiJamjuree font-medium bg-white border border-gray-300 rounded-md px-2 py-1 text-sm text-[#69BCA0]">
                            {project.advance.toLocaleString()}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>

                  <div className="flex flex-row">
                    <Calendar className="w-[24px] h-[24px] relative text-black mr-1" />
                    {/* {item.startDate && item.endDate && ( */}
                    <div className="text-[14px] font-BaiJamjuree flex  gap-1 items-center">
                      <span>{DateText(project)}</span>
                    </div>
                  </div>

                  <div className="flex flex-row ">
                    <Tag className="w-[24px] h-[24px] relative text-black mr-1 flex-shrink-0" />
                    <div className="flex flex-row flex-wrap items-end">
                      {project.tags
                        ?.sort((a, b) => {
                          // Sort Approve tags to the front
                          const aIsApprove = a.name === 'Approved';
                          const bIsApprove = b.name === 'Approved';
                          if (aIsApprove && !bIsApprove) return -1;
                          if (!aIsApprove && bIsApprove) return 1;
                          return 0;
                        })
                        .slice(0, 4) // Keep the slice after sorting
                        .map((tag) => (
                          <TooltipProvider key={tag?.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  key={tag.id}
                                  className={cn(
                                    'h-[24px] min-w-fit px-[8px] py-[2px] flex items-center justify-center mr-1 mt-1 mb-1',
                                    tag.name === 'Approved'
                                      ? 'bg-[#eefafd]  hover:bg-[#eefafd] border-blue text-blue'
                                      : 'bg-[#EEFDF7] hover:bg-[#EEFDF7] border-[#69BCA0] text-[#69BCA0]',
                                  )}>
                                  <span className="truncate max-w-[80px] text-[12px] font-medium font-BaiJamjuree">
                                    {tag.name}
                                  </span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top" align="center">
                                <span className="z-50 bg-white border border-gray-300 rounded-md px-2 py-1 text-sm">
                                  {tag.name}
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      {project.tags && project.tags.length > 4 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                variant="destructive"
                                className="h-[24px] min-w-fit px-[8px] py-[2px] flex items-center justify-center bg-[#EEFDF7] border-x border-y border-[#69BCA0] text-[#69BCA0] mr-1 mt-1 mb-1">
                                <div className="text-[12px] font-medium font-BaiJamjuree">
                                  +{project.tags.length - 4}
                                </div>
                              </Badge>
                            </TooltipTrigger>

                            <TooltipPortal>
                              <TooltipContent
                                side="top"
                                align="center"
                                className="z-50 overflow-visible ">
                                <div className=" flex flex-col flex-wrap items-start">
                                  {project.tags
                                    ?.sort((a, b) => {
                                      const aIsApprove = a.name === 'Approved';
                                      const bIsApprove = b.name === 'Approved';
                                      if (aIsApprove && !bIsApprove) return -1;
                                      if (!aIsApprove && bIsApprove) return 1;
                                      return 0;
                                    })
                                    .slice(4) // Show only the overflow tags in tooltip
                                    .map((tag) => (
                                      <Badge
                                        key={tag?.id}
                                        variant="destructive"
                                        className={cn(
                                          ' h-[24px] min-w-fit px-[8px] py-[12px] flex items-center justify-center mb-1',
                                          tag.name === 'Approved'
                                            ? 'bg-[#eefafd] border-blue text-blue'
                                            : 'bg-[#EEFDF7] border-[#69BCA0] text-[#69BCA0]',
                                        )}>
                                        <span className=" text-xs font-medium font-BaiJamjuree">
                                          {tag?.name}
                                        </span>
                                      </Badge>
                                    ))}
                                </div>
                              </TooltipContent>
                            </TooltipPortal>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="flex w-full items-center justify-center text-center text-lg font-medium">
            No projects{' '}
          </div>
        )}
      </div>
    </>
  );
};
