'use client';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import BASE_URL from '@/lib/shared';
import LoadingClient from '../loading-screen';
import { WorkloadAllUserTable, WorkloadChart } from './chart';
import type { UserWorkload } from '@/lib/shared';
import React from 'react';
import { FilterByDateRange, FilterByTags } from '../control-bar';


export function WorkloadUser() {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [userWorkload, setUserWorkload] = useState<UserWorkload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const fetchAllUserWorkload = async () => {
  //     setIsLoading(true); // เริ่มโหลด
  //     try {
  //       const response = await fetch(`${BASE_URL}/v2/dashboard/workload`, {
  //         headers: { Authorization: auth, "Accept-Encoding": "gzip" },
  //       });

  //       if (!response.ok) {
  //         const errorMessage = await response.text();
  //       }
  //       const data = await response.json();
  //       console.log("Fetched user workload data:", data);
  //       setUserWorkload(data);
  //     } catch (error) {
  //       console.error("Fetch error:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchAllUserWorkload();
  // }, [auth]);

  useEffect(() => {
    const fetchAllUserWorkload = async () => {
      try {
        const response = await fetch('/users.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data); // จะเห็นว่าเป็น { users: [...] }

        setUserWorkload(data.users); // <-- ตรงนี้!!
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchAllUserWorkload(); // <-- เรียกตรงนี้ครั้งเดียวใน useEffect
  }, []);

  function handleDateRangeChange(dateRange: { from: string; to: string; } | undefined): void {
    throw new Error('Function not implemented.');
  }

  function handleTagSelection(selectedValues: string[]): void {
    throw new Error('Function not implemented.');
  }

  return (
    <>
      {/* {isLoading ? (
        <div className="flex justify-center items-center w-full h-screen">
          <LoadingClient />
        </div>
      ) : (
        <>
          <div>
          <WorkloadChart userWorkload={userWorkload} setUserWorkload={setUserWorkload}/>
          </div>
        </>
      )} */}
      <div className="justify-start text-black text-5xl font-semibold font-['Anuphan'] leading-[48px]">Workload</div>
         <div className="flex w-full flex-row gap-2 py-4">
                  <FilterByDateRange onDateChange={handleDateRangeChange} />
                  <FilterByTags onSelectTagChange={handleTagSelection} />
                </div>
      <div>
        <WorkloadChart userWorkload={userWorkload} setUserWorkload={setUserWorkload} />
        <WorkloadAllUserTable userWorkload={userWorkload} setUserWorkload={setUserWorkload}/>
      </div>
    </>
  );
}
export default WorkloadUser;
