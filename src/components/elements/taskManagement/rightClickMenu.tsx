import type { TaskProps } from '@/app/types/types';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import BASE_URL from '@/lib/shared';
import { fetchData } from '@/service/fetchService';
import type React from 'react';

export const RightClickMenu = ({
  trigger,
  task,
}: { trigger: React.ReactElement; task: TaskProps }) => {
  const handleCreateTask = () => {
    fetchData(
      `${BASE_URL}/v2/tasks/duplicateTask/${task.projectId}`,
      'POST',
      [task],
      'Error creating task',
    );
    window.location.reload();
  };
  const handleDeleteTask = async () => {
    try {
      fetchData(`${BASE_URL}/v2/tasks/${task.id}`, 'DELETE', task, 'Error delete task');
    } catch (error) {
      console.error(error);
    } finally {
      window.location.reload();
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>{trigger}</ContextMenuTrigger>
      <ContextMenuContent className="w-40">
        <ContextMenuItem inset onClick={handleCreateTask}>
          Duplicate task
          {/* <ContextMenuShortcut>⌘D</ContextMenuShortcut> */}
        </ContextMenuItem>
        <ContextMenuItem inset onClick={handleDeleteTask}>
          Delete task
          {/* <ContextMenuShortcut>⌘]</ContextMenuShortcut> */}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
