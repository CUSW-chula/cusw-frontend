'use client';

import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import BASE_URL from '@/lib/shared';
import type { TaskProps } from '@/app/types/types';
import { useEffect, useState } from 'react';
import { getUserRoleOnProjectTask } from '@/service/userService';

export const DeleteTask = ({ task }: { task: TaskProps }) => {
  const router = useRouter();
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const handleDeleteTask = async () => {
    const url = `${BASE_URL}/v2/tasks/${task.id}`;
    const options = { method: 'DELETE', headers: { Authorization: auth } };

    try {
      await fetch(url, options);
      router.push(`/projects/${task.projectId}`);
    } catch (error) {
      console.error(error);
    }
  };
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const checkPermissions = async () => {
    try {
      const { role, isAdmin } = await getUserRoleOnProjectTask({
        projectId: task.projectId,
        taskId: task.id,
      });

      if (!role) {
        setHasEditPermission(false);
        return;
      }

      setHasEditPermission(isAdmin || ['ProjectOwner', 'owner', 'assignee'].includes(role));
    } catch (error) {
      console.error('Failed to check permissions:', error);
      setHasEditPermission(false);
    }
  };
  useEffect(() => {
    checkPermissions();
  }, [task]);
  return (
    hasEditPermission && (
      <AlertDialog>
        <AlertDialogTrigger>
          <div className="w-fit h-fit py-1 px-2 bg-red-300 rounded-md border bg-white border-red justify-center items-center gap-2 inline-flex hover:bg-red group">
            <Trash2 className="h-4 w-4 text-red group-hover:text-white" />
            <div className="text-sm font-medium font-BaiJamjuree text-red group-hover:text-white">
              Delete task
            </div>
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the task and can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-red">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  );
};
