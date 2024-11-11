import dynamic from 'next/dynamic';
import ActivityLogs from '@/components/elements/activity-logs';
import Comment from '@/components/elements/comment';
import { MenuBar } from '@/components/elements/menu-bar';
import { BreadcrumbComponent } from '@/components/elements/breadcrumb';

interface TaskManageMentProp {
  params: {
    task_id: string;
  };
}

export default async function TasksManageMentPage({ params }: TaskManageMentProp) {
  const Workspace = dynamic(() => import('../../../components/elements/workspace'), { ssr: true });
  const { task_id } = await params;
  return (
    <div className="min-w-full min-h-screen flex-col items-start justify-center gap-8">
      {/* page nav */}
      <div className="flex py-4">
        <BreadcrumbComponent task_id={task_id} />
      </div>

      {/* page content */}
      <div className="flex-row flex w-full gap-[28px]">
        {/* Left Section */}
        <div className="w-full rounded-[6px] p-5 border-brown border-[1px] bg-white">
          <Workspace task_id={task_id} />
          <div className="flex flex-col gap-4 mt-4">
            <ActivityLogs task_id={task_id} />
            <Comment task_id={task_id} />
          </div>
        </div>

        {/* Right Section */}
        <div className="w-fit">
          <MenuBar task_id={task_id} />
        </div>
      </div>
    </div>
  );
}
