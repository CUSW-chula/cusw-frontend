import { TaskManager } from '@/components/elements/taskmanager';

export default async function Page({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const projectId = (await params).project_id; // Extract projectId from the params
  console.log('projectId', projectId);
  return (
    <div className="min-w-full min-h-screen flex flex-col lg:flex-row items-start justify-center mt-10 gap-8">
      <TaskManager project_id={projectId} />
    </div>
  );
}
