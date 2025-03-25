import { CreateProject } from '@/app/projects/create/_components/createProject';

export default async function Page() {
  return (
    <div className="min-w-full min-h-screen flex flex-col lg:flex-row items-start justify-center mt-10 gap-8">
      <CreateProject />
    </div>
  );
}
