'use client';
import { useEffect, useState } from 'react';
import type { UserWorkload } from '@/lib/shared';
import React from 'react';
import { WorkloadEachUserTable } from './each-user-table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import { FilterTagWorkloadEachUser } from './filter-each-user-workload';
import { WorkloadBackButton } from '../../backButton';
interface WorkloadEachUserProps {
  userData: UserWorkload[];
}

export function WorkloadEachUser({ userData }: WorkloadEachUserProps) {
  const [eachUserWorkload, setEachUserWorkload] = useState<UserWorkload[]>([]);
  const [originalEachUserWorkload, setOriginalUserWorkloadEachUser] = useState<UserWorkload[]>([]);
  function sortProjectsByTaskCount(workloads: UserWorkload[]) {
    return workloads.map((user) => ({
      ...user,
      projects: user.projects.sort((a, b) => b.tasks.length - a.tasks.length),
    }));
  }
  useEffect(() => {
    setEachUserWorkload(sortProjectsByTaskCount(userData) ?? []);
    setOriginalUserWorkloadEachUser(sortProjectsByTaskCount(userData) ?? []);
  }, [userData]);

  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    return nameParts.map((part) => part[0]).join(''); // Take the first letter of each part
  };
  return (
    <>
      <div className="flex flex-col gap-[18px]">
        <div className="flex flex-row ">
          <div className="justify-start text-black text-5xl font-semibold font-['Anuphan'] leading-[48px]">
            Workload Distribution:
          </div>
          <div className=" ml-4 flex flex-row gap-1 items-end">
            {eachUserWorkload.length > 0 && (
              <>
                <div className="w-[36px] h-[36px] items-">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-[36px] h-[36px] bg-gray-100 rounded-full flex items-center justify-center border border-brown">
                          <span className="text-brown text-[18px] font-BaiJamjuree font-medium">
                            {getInitials(eachUserWorkload[0].name || '')}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="bg-white z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md">
                          {eachUserWorkload[0].name}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <span className="text-[21px] font-BaiJamjuree font-normal text-center">
                  {eachUserWorkload[0].name}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex w-full flex-row gap-2 justify-between">
          <FilterTagWorkloadEachUser
            originalUserWorkload={originalEachUserWorkload}
            setUserWorkload={setEachUserWorkload}
          />
          <div className="flex items-center">
            <WorkloadBackButton />
          </div>
        </div>
        <div>
          <WorkloadEachUserTable
            eachUserWorkload={eachUserWorkload}
            setEachUserWorkload={setEachUserWorkload}
          />
        </div>
      </div>
    </>
  );
}
export default WorkloadEachUser;
