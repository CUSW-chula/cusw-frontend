'use client';
import { ProjectList_1 } from '@/components/elements/projectList1';

interface TaskManageMentProp {
  params: {
    project_id: string;
  };
}

export default function Home({ params }: TaskManageMentProp) {
  const { project_id } = params;

  return (
    <div className=" flex flex-wrap flex- w-full items-start gap-[16px]  ">
      <ProjectList_1 />
    </div>
  );
}
