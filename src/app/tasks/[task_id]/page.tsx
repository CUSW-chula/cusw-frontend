import dynamic from 'next/dynamic';
import ActivityLogs from '@/components/elements/activity-logs';
import Comment from '@/components/elements/comment';
import { MenuBar } from '@/components/elements/menu-bar';
import { BreadcrumbComponent } from '@/components/elements/breadcrumb';
import { BackButton } from '@/components/elements/backButton';
import Subtask from '@/components/elements/subtask';
import { DeleteTask } from '@/components/elements/deleteTask';
import BASE_URL, { type Task, type Emojis } from '@/lib/shared';
import { cookies } from 'next/headers';
import { Uploadfile } from '@/components/elements/uploadfile';
import Emoji from '@/components/elements/emoji';

interface Workspace {
  id: string;
  title: string;
  description: string;
}

interface taskEmoji {
  id: string;
  emoji: Emojis[];
}

export default async function TasksManageMentPage({
  params,
}: {
  params: Promise<{ task_id: string }>;
}) {
  const Workspace = dynamic(() => import('../../../components/elements/workspace'), {
    ssr: true,
  });

  const cookieStore = (await cookies()).get('auth')?.value;
  const auth: string = cookieStore?.toString() ?? '';
  const { task_id } = await params;

  const response = await fetch(`${BASE_URL}/v2/tasks/${task_id}`, {
    headers: { Authorization: auth },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch task data: ${response.statusText}`);
  }

  const task: Task = await response.json();

  const workspace: Workspace = {
    id: task.id,
    title: task.title,
    description: task.description,
  };

  const emoji: taskEmoji = {
    id: task.id,
    emoji: task.emojis,
  };

  return (
    <div className="min-w-full min-h-screen flex-col items-start justify-center gap-8 ">
      {/* page nav */}
      <div className="flex flex-row py-4 items-center justify-between">
        <BreadcrumbComponent task_id={task_id} />
        <BackButton task_id={task_id} />
      </div>

      {/* page content */}
      <div className="flex-row flex w-full gap-[28px] ">
        {/* Left Section */}
        <div className="w-full rounded-[6px] p-5 border-brown border-[1px] bg-white">
          <Workspace workspace={workspace} />
          <div className="flex justify-between">
            <Emoji emoji={emoji} />
            <Uploadfile task_id={task_id} />
          </div>
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
