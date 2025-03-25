import { ProjectList } from '@/components/elements/projectList/project-list';
import React from 'react';

export default async function ProjectLists() {
  return (
    <div className="flex flex-col w-full gap-[16px] px-20">
      <ProjectList />
    </div>
  );
}
