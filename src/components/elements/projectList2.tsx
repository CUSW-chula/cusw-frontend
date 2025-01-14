"use client";
import { PopoverContent } from "@radix-ui/react-popover";
import { CommandGroup, CommandItem } from "cmdk";
import {  Calendar, CrownIcon,  Users } from "lucide-react";
import * as React from "react";
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { getCookie } from "cookies-next";
import BASE_URL from "@/lib/shared";



export type User = {
  id: string;
  email: string;
  name: string;
} | null;

export type Tag = {
  id: string;
  name: string;
} | null;

export type Task = {
  id: string;
  title: string;
  description: string;
  parentTaskId: string | null;
  projectId: string;
  startDate: Date | null;
  endDate: Date | null;
  expense: number;
  createdById: string | null;
  owner: User | null;
  members: User[];
  tags: Tag[];
  budget: number;
  advance: number;
  // status: $Enums.TaskStatus;
  subtasks: Task[];
  emojis: Emoji[];
};

export type Prorject = {
  id: string;
  title: string;
  description: string;
  budget: number;
  advance: number;
  expense: number;
  startDate: Date;
  endDate: Date;
  createdById: string;
  owner: User[];
  members: User[];
  tasks: Task[];
  tags: Tag[];
};

export type TaskAssignment = {
  user: User;
  task: Task;
};

export type Emoji = {
  id: string;
  emoji: string;
  taskId: string;
  user: User;
};

// mock data (default users)


export const ProjectList_2 = () => {
  const cookie = getCookie("auth");
  const auth = cookie?.toString() ?? "";
  const [projectList, setProjectList] = React.useState<Prorject[]>([]);

  // ดึงข้อมูลโปรเจกต์เมื่อคอมโพเนนต์ถูกโหลด
  React.useEffect(() => {
    const fetchProjectTitle = async () => {
      try {
        const response = await fetch(`${BASE_URL}/projects`, {
          headers: { Authorization: auth },
        });
        const data = await response.json();
        setProjectList(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjectTitle();
  }, [auth]);
  //owner
  const getInitials = (name: string ) => {
    const nameParts = name.split(" ");
    return nameParts.map((part) => part[0]).join(""); // Take the first letter of each part
  };

  const getFirstName = (name: string) => {
    const nameParts = name.split(" ");
    return nameParts[0];
  };

  const formatDate = (startdate: Date | null, enddate: Date | null): string => {
    // Return an empty string if both dates are not provided
    if (!startdate || !enddate) return "";

    const format = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Format startdate and enddate if they are valid
    const start = startdate ? format(startdate) : "";
    const end = enddate ? format(enddate) : "";

    return `${start}${start && end ? " -> " : ""}${end}`;
  };
  
  return (
    <>
      <div className="flex items-start content-start gap-[16px] flex-wrap  ">
        {projectList.length > 0 ? (
          projectList.map((project) => (
            <div
              key={project.id}
              className="flex flex-start w-[308px] h-[308px] p-[18px] gap-[10px] bg-white border-[1px] border-brown rounded-[6px] relative"
            >
              {/* <div className="flex flex-start gap-[10px] rounded-[6px] self-stretch">
              </div> */}
              <div className="flex flex-col gap-y-[16px] ">
                <div className="h-[56px] w-[204px] self-stretch">
                  <div className="font-BaiJamjuree text-[16px] text-base font-medium leading-[1.75] ">
                    {project.title}
                  </div>
                </div>
                <div className="absolute top-[60px] right-[20px] ">
                <div className="flex flex-row flex-wrap items-center">
                    {project.tags?.slice(0, 1).map((tag) => (
                      <Badge
                        key={tag?.id}
                        variant="destructive"
                        className="h-7 min-w-fit px-[8px] py-[12px] flex items-center justify-center bg-[#EEFDF7] border-x border-y border-[#69BCA0] text-[#69BCA0] mr-1 mt-1 mb-1"
                      >
                        <span className="text-base font-medium font-BaiJamjuree">{tag?.name}</span>
                      </Badge>
                    ))}
                    {project.tags && project.tags.length > 1 && (
                      <Badge
                        variant="destructive"
                        className="h-7 min-w-fit px-[8px] py-[12px] flex items-center justify-center bg-[#EEFDF7] border-x border-y border-[#69BCA0] text-[#69BCA0] mr-1 mt-1 mb-1"
                      >
                        <span className="text-base font-medium font-BaiJamjuree">
                          +{project.tags.length - 1}
                        </span>
                      </Badge>
                    )}</div>
                    </div>



               

                <div className="w-[24px] h-[24px] flex flex-row  ">
                  <img src="/asset/icon/budget-black.svg" alt="Budget Icon " />
                  <div className="font-BaiJamjuree text-[14px] font-medium flex text-center">
                    {project.budget}
                  </div>
                </div>
                <div className="w-[24px] h-[24px] flex flex-row  ">
                  <img src="/asset/icon/budget-red.svg" alt="Budget Icon " />
                  <div className="font-BaiJamjuree text-[14px] font-medium flex text-center text-[#EF4444]">
                    {project.expense}
                  </div>
                </div>
                <div className="w-[24px] h-[24px] flex flex-row  ">
                  <img src="/asset/icon/budget-green.svg" alt="Budget Icon " />
                  <div className="font-BaiJamjuree text-[14px] font-medium flex text-center text-[#69BCA0]">
                    {project.advance}
                  </div>
                </div>
                <div className="flex-row flex">
                  <CrownIcon className="w-[24px] h-[24px] relative text-black" />
                  <TooltipProvider>
                    <div className="flex items-center space-x-[4px]">
                      {project.owner.map((user) => (
                        <Tooltip key={user?.id ?? user?.email}>
                          <TooltipTrigger>
                            <div className="flex items-center space-x-2">
                              <div className="w-[24px] h-[24px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
                                <span className="text-brown text-sm font-BaiJamjuree">
                                  {getInitials(user?.name || "")}
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{user?.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>
                <div className="flex-row flex">
                  <Users className="w-[24px] h-[24px] relative text-black" />
                  <TooltipProvider>
                    <div className="flex items-center space-x-[4px]">
                      {project.members.map((user) => (
                        <Tooltip key={user?.id ?? user?.email}>
                          <TooltipTrigger>
                            <div className="flex items-center space-x-2">
                              <div className="w-[24px] h-[24px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
                                <span className="text-brown text-sm font-BaiJamjuree">
                                  {getInitials(user?.name || "")}
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{user?.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>

                <div className="flex flex-row">
                  <Calendar className="w-[24px] h-[24px] relative text-black" />
                  {/* {item.startDate && item.endDate && ( */}
                    <div className="text-[14px] font-BaiJamjuree flex  gap-1 items-center">
                      <span>
                        {formatDate(
                          new Date(project.startDate),
                          new Date(project.endDate)
                        )}
                      </span>
                    </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>No projects found</div>
        )}
      </div>
    </>
  );
};
