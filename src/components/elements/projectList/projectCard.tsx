import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { DateText } from "../date-feature";
import {  Calendar, CrownIcon, Link, Star, Users } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";
import { UsePinned } from "./sort-pin-project";
import BASE_URL, { type Project } from "@/lib/shared";
import React from "react";
export const ProjectCard = () => {
    const { toggleStar, starredProjects } = UsePinned()
    const [query, setQuery] = React.useState<Project[]>([]);
      //get initials name
  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    return nameParts.map((part) => part[0]).join(''); // Take the first letter of each part
  };

  
return (
    <>
      <div className="flex items-start content-start gap-[16px] flex-wrap ">
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
                className="flex flex-start w-[308px] h-[284px] p-[18px] gap-[10px] bg-white border-[1px] border-brown rounded-[6px] ">
                <div className="flex flex-col gap-y-[8px]">
                  <div className="h-[56px] w-[204px] self-stretch overflow-hidden">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="font-BaiJamjuree text-[16px] text-base font-medium leading-[1.75] truncate w-full">
                            {project.title}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{project.title}</p> {/* Full title on hover */}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="absolute top-[60px] right-[20px]  ">
                    <div className="flex flex-col flex-wrap items-end">
                      {project.tags
                        ?.sort((a, b) => {
                          // Sort Approve tags to the front
                          const aIsApprove = a.name === 'Approve';
                          const bIsApprove = b.name === 'Approve';
                          if (aIsApprove && !bIsApprove) return -1;
                          if (!aIsApprove && bIsApprove) return 1;
                          return 0;
                        })
                        .slice(0, 4) // Keep the slice after sorting
                        .map((tag) => (
                          <Badge
                            key={tag?.id}
                            variant="destructive"
                            className={cn(
                              'h-7 min-w-fit px-[8px] py-[12px] flex items-center justify-center mr-1 mt-1 mb-1',
                              tag.name === 'Approve' || tag.name === 'Rework'
                                ? 'bg-[#eefafd] border-blue text-blue'
                                : 'bg-[#EEFDF7] border-[#69BCA0] text-[#69BCA0]',
                            )}>
                            <span className="text-base font-medium font-BaiJamjuree">
                              {tag?.name}
                            </span>
                          </Badge>
                        ))}
                      {project.tags && project.tags.length > 4 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                variant="destructive"
                                className="h-7 min-w-fit px-[8px] py-[12px] flex items-center justify-center bg-[#EEFDF7] border-x border-y border-[#69BCA0] text-[#69BCA0] mr-1 mt-1 mb-1">
                                <div className="text-base font-medium font-BaiJamjuree">
                                  +{project.tags.length - 4}
                                </div>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="flex flex-col flex-wrap items-start">
                                {project.tags
                                  ?.sort((a, b) => {
                                    const aIsApprove = a.name === 'Approve';
                                    const bIsApprove = b.name === 'Approve';
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
                                        'h-7 min-w-fit px-[8px] py-[12px] flex items-center justify-center mb-1',
                                        tag.name === 'Approve' || tag.name === 'Rework'
                                          ? 'bg-[#eefafd] border-blue text-blue'
                                          : 'bg-[#EEFDF7] border-[#69BCA0] text-[#69BCA0]',
                                      )}>
                                      <span className="text-xs font-medium font-BaiJamjuree">
                                        {tag?.name}
                                      </span>
                                    </Badge>
                                  ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
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
                              <p>{user?.name}</p>
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
                          <TooltipContent>
                            <div className=" flex flex-col flex-wrap items-start">
                              {project.owner?.map((own) => (
                                <span
                                  key={own?.id}
                                  className="text-xs font-medium font-BaiJamjuree  bg-white  text-brown">
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
                              <p>{user?.name}</p>
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
                          <TooltipContent>
                            <div className=" flex flex-col flex-wrap items-start">
                              {project.members?.map((mem) => (
                                <span
                                  key={mem?.id}
                                  className="text-xs font-medium font-BaiJamjuree  bg-white  text-brown">
                                  {mem?.name}
                                </span>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  <div className="w-[24px] h-[24px] flex flex-row  ">
                    <div className="flex items-center justify-center font-BaiJamjuree text-[24px] text-center h-full w-full font-semibold">
                      ฿
                    </div>

                    {/* <img src="/asset/icon/budget-black.svg" alt="Budget Icon " /> */}
                    <div className="font-BaiJamjuree text-[14px] font-medium flex text-center ml-1">
                      {project.budget.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-[24px] h-[24px] flex flex-row  ">
                    <div className="flex items-center justify-center font-BaiJamjuree text-[24px] text-center h-full w-full text-[#EF4444] font-semibold">
                      ฿
                    </div>

                    {/* <img src="/asset/icon/budget-red.svg" alt="Budget Icon " /> */}
                    <div className="font-BaiJamjuree text-[14px] font-medium flex text-center ml-1 text-[#EF4444]">
                      {project.expense.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-[24px] h-[24px] flex flex-row  ">
                    <div className="flex items-center justify-center font-BaiJamjuree text-[24px] text-center h-full w-full text-[#69BCA0] font-semibold">
                      ฿
                    </div>
                    {/* <img src="/asset/icon/budget-green.svg" alt="Budget Icon " /> */}
                    <div className="font-BaiJamjuree text-[14px] font-medium flex text-center ml-1 text-[#69BCA0]">
                      {project.advance.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-row">
                    <Calendar className="w-[24px] h-[24px] relative text-black mr-1" />
                    {/* {item.startDate && item.endDate && ( */}
                    <div className="text-[14px] font-BaiJamjuree flex  gap-1 items-center">
                      <span>{DateText(project)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div>No projects found</div>
        )}
      </div>
    </>
)
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const parseJsonValues = (values: any[]) => {
    return values.map((value) => ({
      id: value.id,
      title: value.title,
      description: value.description,
      budget: value.budget,
      advance: value.advance,
      expense: value.expense,
      startDate: value.startDate,
      endDate: value.endDate,
      createdById: value.cretedById,
      owner: value.owner,
      members: value.members,
      tags: value.tags,
      isPinned: value.isPinned,
    }));
  };