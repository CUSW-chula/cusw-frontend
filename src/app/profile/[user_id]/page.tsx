import React from 'react';
import { TaskManager } from '@/components/elements/taskmanager';
import { ProjectBackButton } from '@/components/elements/backButton';

export default async function Page({ params }: { params: Promise<{ project_id: string }> }) {
  const project_id = (await params).project_id;

  return (
    <div className="min-w-full flex flex-col items-start justify-center gap-4 px-20">
      <div className="flex w-full items-center justify-end">
        <ProjectBackButton project_id={project_id} />
      </div>
      <TaskManager project_id={project_id} />
    </div>
  );
}
