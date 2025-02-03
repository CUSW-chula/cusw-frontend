import React from 'react';
import { TaskManager } from '@/components/elements/taskmanager';
import { ProjectBackButton } from '@/components/elements/backButton';

interface TaskManageMentProp {
  params: {
    project_id: string;
  };
}

export default async function Page({ params }: TaskManageMentProp) {
  const { project_id } = await params;
  return (
    <div className="min-w-full flex-col items-start justify-center gap-8">
      <div className="flex pb-4 items-center justify-end">
        <ProjectBackButton />
      </div>
      <TaskManager project_id={project_id} />
    </div>
  );
}
