import { ProjectList } from '@/components/elements/projectList';

export default async function ProjectLists() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return (
    <div className="flex flex-wrap flex- w-full items-start gap-[16px]  ">
      <ProjectList />
    </div>
  );
}
