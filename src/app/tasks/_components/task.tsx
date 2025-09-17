'use client';
import { MenuBar } from '@/app/tasks/_components/menu-bar';
import { BreadcrumbComponent } from '@/components/elements/breadcrumb';
import { BackButton } from '@/components/elements/backButton';
import Subtask from '@/components/elements/subtask';
import BASE_URL from '@/lib/shared';
import type { TaskProps } from '@/app/types/types';
import { Uploadfile } from '@/components/elements/uploadfile';
import { Comment } from '@/components/elements/comment';
import ActivityLogs from '@/app/tasks/_components/activity-logs';
import { DeleteTask } from '@/app/tasks/_components/deleteTask';
import Emoji from '@/components/elements/emoji';
import { redirect } from 'next/navigation';
import { getUserRoleOnProjectTask } from '@/service/userService';
import Workspace from '@/components/elements/workspace';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';

interface UserRole {
  id: string;
  name: string;
  admin: boolean;
  head: boolean;
}

interface UserRoleData {
  projectRole?: string;
  taskRole?: string;
}

function Task({ taskId }: { taskId: string }) {
  const [task, setTask] = useState<TaskProps>();
  const [currentUser, setCurrentUser] = useState<UserRole>();
  const [userRoleData, setUserRoleData] = useState<UserRoleData>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const cookie = getCookie('auth');
  const auth: string = cookie?.toString() ?? '';

  // Centralized data fetching and access control
  useEffect(() => {
    if (!auth) {
      redirect('/login');
      return;
    }

    const fetchAllData = async () => {
      try {
        setIsLoading(true);

        // Fetch user and task data in parallel
        const [userResponse, taskResponse] = await Promise.all([
          fetch(`${BASE_URL}/v2/users/me`, { headers: { Authorization: auth } }),
          fetch(`${BASE_URL}/v2/tasks/${taskId}`, { headers: { Authorization: auth } }),
        ]);

        if (!userResponse.ok) {
          redirect('/login');
          return;
        }

        if (!taskResponse.ok) {
          throw new Error(`Failed to fetch task: ${taskResponse.statusText}`);
        }

        const [user, taskData] = await Promise.all([userResponse.json(), taskResponse.json()]);

        setCurrentUser(user);
        setTask(taskData);

        // Fetch user role data after we have task data
        const roleData = await getUserRoleOnProjectTask({
          projectId: taskData.projectId,
          taskId: taskData.id,
        });

        setUserRoleData(roleData);

        // Check access permissions
        const isSystemAdmin = user.admin || user.head;
        const hasProjectAccess =
          roleData.projectRole &&
          (roleData.projectRole === 'Member' || roleData.projectRole === 'ProjectOwner');
        const hasTaskAccess =
          roleData.taskRole && (roleData.taskRole === 'assignee' || roleData.taskRole === 'owner');
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const isTaskMember = taskData.members?.some((member: any) => member.id === user.id);
        // const isTaskOwner = taskData.owner?.some((owner: any) => owner.id === user.id);
        const isTaskCreator = taskData.createdById === user.id;

        const hasAccess =
          isSystemAdmin || hasProjectAccess || hasTaskAccess || isTaskMember || isTaskCreator;

        if (!hasAccess) {
          console.warn(`User ${user.id} attempted to access task ${taskId} without permission`);
          redirect('/projects');
        }

        setHasAccess(true);
      } catch (error) {
        console.error('Error fetching data:', error);
        redirect('/projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [auth, taskId]); // Only depend on auth and taskId

  if (isLoading || !hasAccess || !task) {
    return <div>Loading...</div>;
  }

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

export default Task;
