'use client';
import { ProjectList } from '@/components/elements/projectList';
import { ProjectList1 } from '@/components/elements/projectlist2';

export default function ProjectLists() {
  return (
    <div className="flex flex-wrap flex- w-full items-start gap-[16px]  ">
      <ProjectList1 />
    </div>
  );
}
