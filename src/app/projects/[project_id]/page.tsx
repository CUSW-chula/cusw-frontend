import React from 'react';
import { TaskManager } from '@/components/elements/taskmanager';
import { ProjectBackButton } from '@/components/elements/backButton';
import { Toaster } from '@/components/ui/toaster';

export default async function Page({ params }: { params: Promise<{ project_id: string }> }) {
  const project_id = (await params).project_id;
  return (
    <div className="min-w-full flex-col items-start justify-center gap-8">
      <div className="flex pb-4 items-center justify-end">
        <ProjectBackButton />
      </div>
      <TaskManager project_id={project_id} />
    </div>
  );
}
