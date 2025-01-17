import React from 'react';
import { ProjectList } from '@/components/elements/projectList';
interface TaskManageMentProp {
  params: {
    project_id: string;
  };
}

export default async function Page({ params}: TaskManageMentProp) {
  return (
    <div className="min-w-full min-h-screen flex flex-col lg:flex-row items-start justify-center mt-10 gap-8">
      <div className=" flex flex-wrap flex- w-full items-start gap-[16px]  ">
        <ProjectList />
      </div>
    </div>
  );
}
