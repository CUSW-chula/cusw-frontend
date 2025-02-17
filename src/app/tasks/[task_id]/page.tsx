import dynamic from 'next/dynamic';
import { MenuBar } from '@/app/tasks/_components/menu-bar';
import { BreadcrumbComponent } from '@/components/elements/breadcrumb';
import { BackButton } from '@/components/elements/backButton';
import Subtask from '@/components/elements/subtask';
import BASE_URL, { type Emojis } from '@/lib/shared';
import { cookies } from 'next/headers';
import type { TaskProps } from '@/app/types/types';
import { Uploadfile } from '@/components/elements/uploadfile';
import { Comment } from '@/components/elements/comment';
import ActivityLogs from '@/app/tasks/_components/activity-logs';
import { DeleteTask } from '@/app/tasks/_components/deleteTask';
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

  const task: TaskProps = await response.json();

  const workspace: Workspace = {
    id: task.id,
    title: task.title,
    description: task.description,
  };

  return (
    <div className="min-w-full flex-col items-start justify-center gap-8 ">
      {/* page nav */}
      <div className="flex flex-row py-4 items-center justify-between">
        <BreadcrumbComponent task={task} />
        <BackButton task={task} />
      </div>

      {/* page content */}
      <div className="flex-row flex w-full gap-[28px] ">
        {/* Left Section */}
        <div className="w-full rounded-[6px] p-5 border-brown border-[1px] bg-white">
          <Workspace workspace={workspace} />
          <div className="flex justify-between">
            {/* <Emoji task={task} /> */}
            <Uploadfile task={task} />
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <Subtask task={task} />
            <ActivityLogs task={task} />
            <Comment task={task} />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col w-fit gap-4">
          <MenuBar task={task} />
          <div className="inline-flex justify-end">
            {' '}
            <DeleteTask task={task} />
          </div>
        </div>
      </div>
    </div>
  );
}
