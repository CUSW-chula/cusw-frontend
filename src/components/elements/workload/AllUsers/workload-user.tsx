'use client';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import BASE_URL from '@/lib/shared';
import { WorkloadAllUserTable, WorkloadChart } from './chart-table-workload';
import type { UserWorkload } from '@/lib/shared';
import React from 'react';
import { FilterAllUserWorkload } from './filter-user-workload';
import { AdminBackButton } from '../../backButton';

export function WorkloadUser() {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [userWorkload, setUserWorkload] = useState<UserWorkload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [originalUserWorkload, setOriginalUserWorkload] = useState<UserWorkload[]>([]);

  function sortUserWorkloadByProjectCount(workloads: UserWorkload[]) {
    return workloads.sort((a, b) => b.projects.length - a.projects.length);
  }
  function sortUserWorkloadByProjectAndTaskCount(workloads: UserWorkload[]) {
    return workloads.sort((a, b) => {
      const projectCountA = a.projects.length;
      const projectCountB = b.projects.length;

      if (projectCountA !== projectCountB) {
        return projectCountB - projectCountA; // มากไปน้อย
      }

      const taskCountA = a.projects.reduce((sum, project) => sum + project.tasks.length, 0);
      const taskCountB = b.projects.reduce((sum, project) => sum + project.tasks.length, 0);

      return taskCountB - taskCountA; // มากไปน้อย
    });
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
        const sortedData = sortUserWorkloadByProjectAndTaskCount(data);
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
      <div className="flex flex-col gap-y-[18px]">
        <div className="justify-start text-black text-5xl font-semibold font-['Anuphan'] leading-[48px]">
          Workload Distribution
        </div>

        <div className="flex w-full flex-row  justify-between">
          <FilterAllUserWorkload
            originalUserWorkload={originalUserWorkload}
            setUserWorkload={setUserWorkload}
          />
          <div className="flex items-center">
            <AdminBackButton />
          </div>
        </div>
        <WorkloadChart userWorkload={userWorkload} />
        <WorkloadAllUserTable userWorkload={userWorkload} />
      </div>
    </>
  );
}
export default WorkloadUser;
