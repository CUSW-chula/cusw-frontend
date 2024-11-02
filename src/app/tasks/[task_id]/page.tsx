import dynamic from 'next/dynamic';
import ActivityLogs from '@/components/elements/activity-logs';
import Comment from '@/components/elements/comment';
import { MenuBar } from '@/components/elements/menu-bar';

interface TaskManageMentProp {
  params: {
    task_id: string;
  };
}

export default function TasksManageMentPage({ params }: TaskManageMentProp) {
  const Workspace = dynamic(() => import('../../../components/elements/workspace'), { ssr: true });
  const { task_id } = params;
  return (
    <div className="min-w-full min-h-screen flex flex-col lg:flex-row items-start justify-center mt-10 gap-8">
      {/* Left Section */}
      <div className="w-full lg:w-[60%] rounded-[6px] p-5 border-brown border-[1px] bg-white">
        <Workspace task_id={task_id} />
        <div className="flex flex-col gap-4 mt-4">
          <ActivityLogs />
          <Comment task_id={task_id} />
        </div>
      </div>

      {/* Right Section */}
      <MenuBar task_id={task_id} />
    </div>
  );
}
