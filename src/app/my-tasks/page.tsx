import { ProjectBackButton } from '@/components/elements/backButton';
import { MyTaskManager } from '@/components/elements/my-task';
import { TaskManager } from '@/components/elements/taskmanager';
import React from 'react';

export default async function Page({ params }: { params: Promise<{ project_id: string }> }) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const project_id = (await params).project_id;

  return (
    <div className="min-w-full flex-col items-start justify-center gap-8">
      <MyTaskManager />
    </div>
  );
}
