import type { TaskProps } from '@/app/types/types';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import BASE_URL from '@/lib/shared';
import { can } from '@/permissions/helper';
import { fetchData } from '@/service/fetchService';
import { getUserRoleOnProjectTask } from '@/service/userService';
import { Ellipsis } from 'lucide-react';
import { useEffect, useState } from 'react';

export const TaskActionsMenu = ({
  task,
  onTaskDelete,
}: {
  task: TaskProps;
  onTaskDelete?: () => void;
}) => {
  const handleDuplicateTask = async () => {
    try {
      await fetchData(
        `${BASE_URL}/v2/tasks/duplicateTask/${task.projectId}`,
        'POST',
        [task],
        'Error duplicating task',
      );
      window.location.reload();
    } catch (error) {
      console.error('Duplication error:', error);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await fetchData(`${BASE_URL}/v2/tasks/${task.id}`, 'DELETE', task, 'Error deleting task');
      onTaskDelete?.();
    } catch (error) {
      toast({
        title: 'Error deleting task',
        description: 'An error occurred while deleting the task.',
      });
      console.error('Deletion error:', error);
    }
  };

  const DeleteTask = () => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="cursor-pointer px-4 py-2 hover:bg-gray-100 text-red-600 focus:text-red-600">
            Delete Task
          </DropdownMenuItem>
        </AlertDialogTrigger>

        <AlertDialogContent className="max-w-md rounded-lg">
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
    );
  };
  const [hasEditPermission, setHasEditPermission] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const { projectRole, taskRole, isAdmin, isHead } = await getUserRoleOnProjectTask({
        projectId: task.projectId,
        taskId: task.id,
      });
      setHasEditPermission(can('deleteTask', { projectRole, taskRole, isAdmin, isHead }));
    };

    checkPermission();
  }, [task.projectId, task.id]);
  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Ellipsis className="cursor-pointer h-5 w-5 hover:text-gray-600" />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-40 border rounded-lg shadow-lg">
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
            onClick={handleDuplicateTask}>
            Duplicate Task
          </DropdownMenuItem>
          {hasEditPermission && <DeleteTask />}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
