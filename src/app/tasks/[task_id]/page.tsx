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
import { redirect } from 'next/navigation';
import { getUserRoleOnProjectTask } from '@/service/userService';
import Task from '../_components/task';

interface Workspace {
  id: string;
  title: string;
  description: string;
}

interface taskEmoji {
  id: string;
  emoji: Emojis[];
}

interface UserRole {
  id: string;
  name: string;
  admin: boolean;
  head: boolean;
}

export default async function TasksManageMentPage({
  params,
}: {
  params: Promise<{ task_id: string }>;
}) {
  const { task_id } = await params;

  return <Task taskId={task_id} />;
}
