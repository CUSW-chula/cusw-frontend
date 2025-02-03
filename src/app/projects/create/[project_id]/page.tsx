import { CreateProject } from '@/components/elements/create-project';

export default async function Page({
  params,
}: {
  params: Promise<{ project_id: string }>
}) {
  const projectId = (await params).project_id; // Extract projectId from the params

  return (
    <div className="min-w-full min-h-screen flex flex-col lg:flex-row items-start justify-center mt-10 gap-8">
      <CreateProject project_id={projectId} />
    </div>
  );
}