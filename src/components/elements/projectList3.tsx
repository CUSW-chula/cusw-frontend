'use client';
import { PopoverContent } from '@radix-ui/react-popover';
import { CommandGroup, CommandItem } from 'cmdk';
import { Calendar, CrownIcon, Users } from 'lucide-react';
import * as React from 'react';

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
type ImageProps = {
  src: string; // URL ของรูปภาพ
  alt: string; // คำอธิบายภาพ
  width?: number | string; // ความกว้าง (ไม่บังคับ)
  height?: number | string; // ความสูง (ไม่บังคับ)
  className?: string; // คลาส CSS (ไม่บังคับ)
};

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
const users: UsersInterfaces[] = [{ id: '1', userName: 'Tiwadol Aungmart' }];

export const ProjectList_3 = () => {
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
      <div>
        <div className="flex flex-start w-[416px] h-[260px] p-[18px] gap-[10px]  bg-white border-[1px] border-brown rounded-[6px]">
          <div className="flex flex-start gap-[10px] rounded-[6px] self-stretch">
            <img width={158} height={224} alt="img" src="/asset/Options.svg" />
          </div>
          {/*Project name  */}
          <div className="flex flex-col gap-y-2 ">
            <div className="h-[56px] w-[204px] self-stretch">
              <div className="font-BaiJamjuree  text-base font-medium leading-[1.75] ">
                จ้างงานในเวลา
              </div>
            </div>

            {/*Budget  */}
            <div className="w-[24px] h-[24px] flex flex-row  ">
              <img
                src="/asset/icon/budget-black.svg"
                alt="Budget Icon "
                className=" text-black  "
              />
              <div className="font-BaiJamjuree text-[14px] font-medium flex text-center">
                1,000,000.00
              </div>
            </div>

            <div className="w-[24px] h-[24px] flex flex-row  ">
              <img src="/asset/icon/budget-red.svg" alt="Budget Icon " />
              <div className="font-BaiJamjuree text-[14px] font-medium flex text-center text-[#EF4444]">
                814,252.17
              </div>
            </div>

            {/* Project owner */}
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

            {/* Member */}
            <div className="flex flex-row ">
              <Users className="w-[24px] h-[24px] relative text-black" />
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

            {/* Date */}
            <div className="flex flex-row">
              <Calendar className="w-[24px] h-[24px] relative text-black" />
              {item.startDate && item.endDate && (
                <div className="text-[14px] font-BaiJamjuree flex  gap-1 items-center">
                  <span>{formatDate(item.startDate, item.endDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
