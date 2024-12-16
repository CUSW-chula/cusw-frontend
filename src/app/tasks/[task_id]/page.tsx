import dynamic from 'next/dynamic';
import ActivityLogs from '@/components/elements/activity-logs';
import Comment from '@/components/elements/comment';
import { MenuBar } from '@/components/elements/menu-bar';
import { BreadcrumbComponent } from '@/components/elements/breadcrumb';
import { BackButton } from '@/components/elements/backButton';
import Subtask from '@/components/elements/subtask';
import { DeleteTask } from '@/components/elements/deleteTask';

interface TaskManageMentProp {
  params: {
    task_id: string;
  };
}

export default async function TasksManageMentPage({ params }: TaskManageMentProp) {
  const Workspace = dynamic(() => import('../../../components/elements/workspace'), { ssr: true });
  const { task_id } = await params;
  return (
    <div className="flex flex-col items-start justify-center gap-1 ">
      {/* page nav */}
      <div className="flex flex-row w-full py-4 items-center justify-between">
        <BreadcrumbComponent task_id={task_id} />
        <BackButton task_id={task_id} />
      </div>

      {/* page content */}
      <div className="flex flex-row w-full gap-[28px] ">
        {/* Left Section */}
        <div className="w-full rounded-[6px] p-5 border-brown border-[1px] bg-white">
          <Workspace task_id={task_id} />
          <div className="flex flex-col gap-4 mt-4">
            <Subtask task_id={task_id} />
            <ActivityLogs task_id={task_id} />
            <Comment task_id={task_id} />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col w-fit gap-4">
          <MenuBar task_id={task_id} />
          <div className="inline-flex justify-end">
            <DeleteTask task_id={task_id} />
          </div>
        </div>
      </div>
    </div>
  );
}
