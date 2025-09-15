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

  // ใช้ getUserRoleOnProjectTask เพื่อตรวจสอบสิทธิ์
  const userRoleData = await getUserRoleOnProjectTask({
    projectId: task.projectId,
    taskId: task.id,
  });

  // ดึงข้อมูล role จาก userRoleData
  const roleInProject = userRoleData.projectRole;
  const roleInTask = userRoleData.taskRole;

  // --- ตรวจสอบสิทธิ์ ---
  const isTaskOwner = roleInTask === 'owner';

  // ตรวจสอบสิทธิ์การเข้าถึง task
  // 1. ต้องเป็น admin หรือ head ของระบบ หรือ
  // 2. ต้องมี role ในโปรเจคนี้ (Member หรือ ProjectOwner) หรือ
  // 3. ต้องถูก assign ใน task นี้ (assignee หรือ owner)
  const isSystemAdmin = currentUser.admin || currentUser.head;

  const hasProjectAccess =
    roleInProject && (roleInProject === 'Member' || roleInProject === 'ProjectOwner');

  const hasTaskAccess =
    roleInTask && (roleInTask === 'assignee' || roleInTask === 'owner');

  console.log('Access check:', {
    userId: currentUser.id,
    taskId: task_id,
    projectId: task.projectId,
    isSystemAdmin,
    projectRole: roleInProject,
    taskRole: roleInTask,
    hasProjectAccess,
    hasTaskAccess,
  });

  // ถ้าไม่มีสิทธิ์เข้าถึง ให้ redirect ไป project list
  if (!isSystemAdmin && !hasProjectAccess && !hasTaskAccess) {
    console.warn(
      `User ${currentUser.id} attempted to access task ${task_id} but doesn't have permission`,
    );
    redirect('/projects');
  }

  // --- กำหนดสิทธิ์การจัดการต่างๆ ---
  // Admin และ Head สามารถจัดการทุกอย่างได้
  // ProjectOwner สามารถจัดการทุกอย่างในโปรเจคได้
  // Task Owner สามารถจัดการ task ของตัวเองได้
  const canManageTags = isSystemAdmin || roleInProject === 'ProjectOwner' || isTaskOwner;
  const canManageMoney = isSystemAdmin || roleInProject === 'ProjectOwner' || isTaskOwner;
  const canManageDate = isSystemAdmin || roleInProject === 'ProjectOwner' || isTaskOwner;
  const canAssignTasks = isSystemAdmin || roleInProject === 'ProjectOwner' || isTaskOwner;

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
          <MenuBar
            task={task}
            canManageTags={canManageTags}
            canManageMoney={canManageMoney}
            canManageDate={canManageDate}
            canAssignTasks={canAssignTasks}
          />
          {(isSystemAdmin || roleInProject === 'ProjectOwner') && <DeleteTask task={task} />}
        </div>
      </div>
    </div>
  );
}
