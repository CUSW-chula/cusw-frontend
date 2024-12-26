'use client';
import { PopoverContent } from '@radix-ui/react-popover';
import { CommandGroup, CommandItem } from 'cmdk';
import { Calendar, CrownIcon, User, Users } from 'lucide-react';
import * as React from 'react';

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { getCookie } from 'cookies-next';
import BASE_URL from '@/lib/shared';
interface ProjectInterface {
  id: string;
  title: string;
  description: string;
  expectedBudget: number;
  realBudget: number;
  usedBudget: number;
  startDate: Date;
  endDate: Date;
}

interface UsersInterfaces {
  id: string;
  userName: string;
}

interface Date_st {
  startDate: Date;
  endDate: Date;
}
const item: Date_st = {
  startDate: new Date(), // วันที่เริ่มต้น
  endDate: new Date(), // วันที่สิ้นสุด
};

// mock data (default users)
const users: UsersInterfaces[] = [
  { id: '1', userName: 'Mintada Phuangminthada' },
  { id: '2', userName: 'Dintada Ahuangminthada' },
];

export const ProjectList_2 = () => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [projectList, setProjectList] = React.useState<ProjectInterface[]>([]);
  
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
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjectTitle();
  }, [auth]);
  //owner
  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    return nameParts.map((part) => part[0]).join(''); // Take the first letter of each part
  };

  const getFirstName = (name: string) => {
    const nameParts = name.split(' ');
    return nameParts[0];
  };

  const formatDate = (startdate: Date | null, enddate: Date | null): string => {
    // Return an empty string if both dates are not provided
    if (!startdate || !enddate) return '';

    const format = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Format startdate and enddate if they are valid
    const start = startdate ? format(startdate) : '';
    const end = enddate ? format(enddate) : '';

    return `${start}${start && end ? ' -> ' : ''}${end}`;
  };

  return (
    <>
      <div className="flex items-start content-start gap-[16px] flex-wrap ">
        {projectList.length > 0 ? (
          projectList.map((project) => (
            <div
              key={project.id}
              className="flex flex-start w-[416px] h-[260px] p-[18px] gap-[10px] bg-white border-[1px] border-brown rounded-[6px]">
              <div className="flex flex-start gap-[10px] rounded-[6px] self-stretch">
                <img width={158} height={224} alt="img" src="/asset/Options.svg" />
              </div>
              <div className="flex flex-col gap-y-[16px] ">
                <div className="h-[56px] w-[204px] self-stretch">
                  <div className="font-BaiJamjuree text-[16px] text-base font-medium leading-[1.75] ">
                    {project.title}
                  </div>
                </div>
                <div className="w-[24px] h-[24px] flex flex-row  ">
                  <img src="/asset/icon/budget-black.svg" alt="Budget Icon " />
                  <div className="font-BaiJamjuree text-[14px] font-medium flex text-center">
                    1,500,000.00
                  </div>
                </div>
                <div className="w-[24px] h-[24px] flex flex-row  ">
                  <img src="/asset/icon/budget-red.svg" alt="Budget Icon " />
                  <div className="font-BaiJamjuree text-[14px] font-medium flex text-center text-[#EF4444]">
                    1,245,145.14
                  </div>
                </div>
                <div className="flex-row flex">
                  <CrownIcon className="w-[24px] h-[24px] relative text-black" />
                  <TooltipProvider>
                    <div className="flex items-center space-x-[4px]">
                      {users.map((user) => (
                        <Tooltip key={user.id}>
                          <TooltipTrigger>
                            <div className="flex items-center space-x-2">
                              <div className="w-[24px] h-[24px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
                                <span className="text-brown text-sm font-BaiJamjuree">
                                  {getInitials(user.userName)}
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{user.userName}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>
                <div className="flex-row flex">
                  <User className="w-[24px] h-[24px] relative text-black" />
                  <TooltipProvider>
                    <div className="flex items-center space-x-[4px]">
                      {users.map((user) => (
                        <Tooltip key={user.id}>
                          <TooltipTrigger>
                            <div className="flex items-center space-x-2">
                              <div className="w-[24px] h-[24px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
                                <span className="text-brown text-sm font-BaiJamjuree">
                                  {getInitials(user.userName)}
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{user.userName}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>

                <div className="flex flex-row">
                  <Calendar className="w-[24px] h-[24px] relative text-black" />
                  {item.startDate && item.endDate && (
                    <div className="text-[14px] font-BaiJamjuree flex  gap-1 items-center">
                      <span>{formatDate(new Date (project.startDate),new Date (project.endDate))}</span>
                    </div>
                  )}
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
