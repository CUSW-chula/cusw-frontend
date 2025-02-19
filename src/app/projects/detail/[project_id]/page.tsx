import React from 'react';
import { ProjectDetail } from '@/components/elements/projectdetail';
import BASE_URL, { type Project } from '@/lib/shared';
import { cookies } from 'next/headers';

export default async function Page({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const cookieStore = (await cookies()).get('auth')?.value;
  const auth: string = cookieStore?.toString() ?? '';
  const projectId = (await params).project_id; // Extract projectId from the params

  const response = await fetch(`${BASE_URL}/v2/projects/${projectId}`, {
    headers: { Authorization: auth },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch task data: ${response.statusText}`);
  }

  const project: Project= await response.json();

  return (
    <div className="min-w-full min-h-screen flex flex-col lg:flex-row items-start justify-center mt-10 gap-8">
      <ProjectDetail project={project} />
    </div>
  );
}
