
import { ProjectList } from '@/components/elements/projectList';

export default async function ProjectLists() {
  return (
    <div className="flex flex-wrap flex- w-full items-start gap-[16px]  ">
      <ProjectList />
    </div>
  );
}
