import BASE_URL, { type UserWorkload, type Project } from '@/lib/shared';
import { cookies } from 'next/headers';
import React from 'react';
import WorkloadEachUser from '@/components/elements/workload/EachUser/workload-each-user';

export default async function Page({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const cookieStore = (await cookies()).get('auth')?.value;
  const auth: string = cookieStore?.toString() ?? '';
  const userId = (await params).user_id;

  const response = await fetch(`${BASE_URL}/v2/dashboard/workload/${userId}`, {
    headers: { Authorization: auth },
  });
  if (!response.ok) {
    throw new Error();
  }
  const userData: UserWorkload = await response.json();
  const userArray = [userData];
  console.log('userdata', userData);
  return (
    <div className="min-w-full flex-col items-start justify-center  px-20 pb-20">
      <WorkloadEachUser userData={userArray} />
    </div>
  );
}
