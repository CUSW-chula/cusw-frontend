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

interface Workspace {
  id: string;
  title: string;
  description: string;
}

interface taskEmoji {
  id: string;
  emoji: Emojis[];
}

interface ProjectRole {
  id: string;
  title: string;
  role: 'Member' | 'ProjectOwner';
  tasks: unknown[];
  tags: unknown[];
  startDate: string;
  endDate: string;
}

interface UserRole {
  id: string;
  name: string;
  email: string;
  admin: boolean;
  head: boolean;
  activated: boolean;
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

  // ตรวจสอบ authentication
  if (!auth) {
    redirect('/login');
  }

  const response = await fetch(`${BASE_URL}/v2/tasks/${task_id}`, {
    headers: { Authorization: auth },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch task data: ${response.statusText}`);
  }

  const task: TaskProps = await response.json();

  // ดึงข้อมูลผู้ใช้ปัจจุบัน
  const userResponse = await fetch(`${BASE_URL}/v2/users/me`, {
    headers: { Authorization: auth },
  });
  if (!userResponse.ok) {
    console.error('User authentication failed, redirecting to login');
    redirect('/login');
  }

  const currentUser: UserRole = await userResponse.json();

  // ดึงข้อมูล user role ในโปรเจคต่าง ๆ
  const userRoleResponse = await fetch(`${BASE_URL}/v2/users/userrole/${currentUser.id}`, {
    headers: { Authorization: auth },
  });
  if (!userRoleResponse.ok) {
    console.error('Failed to fetch user roles, redirecting to projects');
    redirect('/projects');
  }

  const userProjects: ProjectRole[] = await userRoleResponse.json();

  // ตรวจสอบสิทธิ์การเข้าถึง task
  // 1. ต้องเป็น admin หรือ head ของระบบ หรือ
  // 2. ต้องเป็น Member หรือ ProjectOwner ของโปรเจคที่ task นี้อยู่
  const isSystemAdmin = currentUser.admin || currentUser.head;
  const hasProjectAccess = userProjects.some(
    (project) =>
      project.id === task.projectId &&
      (project.role === 'Member' || project.role === 'ProjectOwner'),
  );

  // ถ้าไม่มีสิทธิ์เข้าถึง ให้ redirect ไป project list
  if (!isSystemAdmin && !hasProjectAccess) {
    console.warn(
      `User ${currentUser.id} attempted to access task ${task_id} but doesn't have permission`,
    );
    redirect('/projects');
  }

  const workspace: Workspace = {
    id: task.id,
    title: task.title,
    description: task.description,
  };

  return (
    <div className="w-full flex-col items-start justify-center gap-8 px-20">
      {/* page nav */}
      <div className="flex flex-row py-4 items-center justify-between">
        <BreadcrumbComponent task={task} />
        <BackButton task={task} />
      </div>

      {/* page content */}
      <div className="flex flex-row w-full gap-[28px]">
        {/* Left Section */}
        <div className="flex flex-col w-full max-w-[calc(100%-388px)] rounded-[6px] p-5 border-brown border-[1px] bg-white">
          <Workspace task={task} />
          <div className="w-full flex justify-between">
            <Emoji task={task} />
            <Uploadfile task={task} />
          </div>
          <div className="w-full flex flex-col gap-4 mt-4">
            <Subtask task={task} />
            <ActivityLogs task={task} />
            <Comment task={task} />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col gap-4 items-end">
          <MenuBar task={task} />
          <DeleteTask task={task} />
        </div>
      </div>
    </div>
  );
}
