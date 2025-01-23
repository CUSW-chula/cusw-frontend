import React from 'react';
import { TaskManager } from '@/components/elements/taskmanager';
import { CreateProject } from '@/components/elements/create-project';

interface TaskManageMentProp {
  params: {
    project_id: string;
  };
}

export default async function Page({ params }: TaskManageMentProp) {
  const { project_id } = params;
  return (
    <div className="min-w-full min-h-screen flex flex-col lg:flex-row items-start justify-center mt-10 gap-8">
      <TaskManager project_id={project_id} />
    </div>
  );
}
