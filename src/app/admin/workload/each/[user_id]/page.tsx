
import BASE_URL, {type UserWorkload, type Project } from '@/lib/shared';
import { cookies } from 'next/headers';
import { WorkloadEachUserTable } from '@/components/elements/workload/each-user-table';
import React from 'react';
import WorkloadEachUser from '@/components/elements/workload/EachUser/workload-each-user';

export default async function Page({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const cookieStore = (await cookies()).get('auth')?.value;
  const auth: string = cookieStore?.toString() ?? '';
  const userId = (await params).user_id; // Extract projectId from the params
//   const response = await fetch(`${BASE_URL}/v2/dashboard/workload/${userId}`, {
//     headers: { Authorization: auth },
//   });
//   if (!response.ok) {
//     throw new Error();
//   }
//   const userData: UserWorkload = await response.json();

  

  return (
    <div className="w-full flex flex-col lg:flex-row items-start justify-center">
     <WorkloadEachUser/>
    </div>
  );
}
