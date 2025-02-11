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

interface DeleteTaskProps {
  task_id: string;
}

export const DeleteTask = ({ task }: { task: TaskProps }) => {
  const router = useRouter();
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const handleDeleteTask = async () => {
    const url = `${BASE_URL}/v2/tasks/${task.id}`;
    const options = { method: 'DELETE', headers: { Authorization: auth } };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(data);
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <div className="h-9 w-40 px-2 py-1.5 bg-red-300 rounded-md border bg-white border-red justify-start items-start gap-[13px] inline-flex hover:bg-red group">
          <Trash2 className="w-6 h-6 text-red group-hover:text-white" />
          <div className="text-base font-semibold font-BaiJamjuree text-red group-hover:text-white">
            Delete Task
          </div>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
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
  );
};
