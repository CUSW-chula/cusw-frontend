'use client';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import BASE_URL from '@/lib/shared';
import { WorkloadAllUserTable, WorkloadChart } from './chart';
import type { UserWorkload } from '@/lib/shared';
import React from 'react';
import { FilterByDateRange, FilterByTags } from '../../control-bar';
import { FilterTagWorkload } from './filter-user-workload';

export function WorkloadUser() {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [userWorkload, setUserWorkload] = useState<UserWorkload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [originalUserWorkload, setOriginalUserWorkload] = useState<UserWorkload[]>([]);

  function sortUserWorkloadByProjectCount(workloads: UserWorkload[]) {
  return workloads.sort((a, b) => b.projects.length - a.projects.length);
}
  useEffect(() => {
    const fetchAllUserWorkload = async () => {
      setIsLoading(true); // เริ่มโหลด
      try {
        const response = await fetch(`${BASE_URL}/v2/dashboard/workload`, {
          headers: { Authorization: auth, 'Accept-Encoding': 'gzip' },
        });

        if (!response.ok) {
          const errorMessage = await response.text();
        }
        const data = await response.json();
        console.log('Fetched user workload data:', data);
        const sortedData = sortUserWorkloadByProjectCount(data);
        setUserWorkload(sortedData);
setOriginalUserWorkload(sortedData);

       
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllUserWorkload();
  }, [auth]);

  return (
    <>
      <div className="flex flex-col gap-[18px]">
        <div className="justify-start text-black text-5xl font-semibold font-['Anuphan'] leading-[48px]">
          Workload
        </div>
        <div className="flex w-full flex-row gap-2 py-4">
        <FilterTagWorkload
 originalUserWorkload={originalUserWorkload}
  setUserWorkload={setUserWorkload}
/>
        </div>
        <div>
          <WorkloadChart userWorkload={userWorkload} />
          <WorkloadAllUserTable userWorkload={userWorkload}  />
        </div>
      </div>
    </>
  );
}
export default WorkloadUser;
