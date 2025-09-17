'use client';
import { useState, useEffect } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { type Block, BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import { getCookie } from 'cookies-next';
import { Sort, Task } from './taskManagement';
import type { TaskProps } from '@/app/types/types';
import { CreateSubtask } from './createSubtask';
import { getUserRoleOnProjectTask } from '@/service/userService';
import { can } from '@/permissions/helper';

// Helper functions for localStorage
const loadExpandedState = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  const saved = localStorage.getItem('expandedTaskIds');
  return saved ? new Set(JSON.parse(saved)) : new Set();
};

const saveExpandedState = (ids: Set<string>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('expandedTaskIds', JSON.stringify(Array.from(ids)));
  }
};

const Subtask = ({ task }: { task: TaskProps }) => {
  const [isSubtaskSectionVisible, setIsSubtaskSectionVisible] = useState(false);
  const [isSubtaskVisible, setIsSubtaskVisible] = useState(false);
  const [subtasks, setSubtasks] = useState<TaskProps[]>([]);
  const cookie = getCookie('auth');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(loadExpandedState);
  // Permission state management
  const [hasEditPermission, setHasEditPermission] = useState(false);

  const handleToggle = (taskId: string) => {
    const newIds = new Set(expandedIds);
    newIds.has(taskId) ? newIds.delete(taskId) : newIds.add(taskId);
    setExpandedIds(new Set(newIds));
  };

  useEffect(() => {
    saveExpandedState(expandedIds);
  }, [expandedIds]);

  useEffect(() => {
    const checkPermission = async () => {
      const { projectRole, taskRole, isAdmin, isHead } = await getUserRoleOnProjectTask({
        projectId: task.projectId,
        taskId: task.id,
      });
      setHasEditPermission(can('createSubtask', { projectRole, taskRole, isAdmin, isHead }));
    };

    checkPermission();
  }, [task.projectId, task.id]);

  useEffect(() => {
    try {
      if (task.subtasks) {
        const sortedSubtasks = [...task.subtasks].sort((a, b) => {
          const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
          const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
          return dateA - dateB;
        });
        setSubtasks(sortedSubtasks);
        task.subtasks.map((item) => {});
      }
    } catch (error) {
      console.error('Error');
    }
  }, [task.subtasks]);

  const handleToggleSubtask = () => {
    setIsSubtaskVisible(!isSubtaskVisible);
  };

  const { audio, image, video, file, ...allowedBlockSpecs } = defaultBlockSpecs;

  return (
    <>
      <div className="flex items-center py-1 w-full justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSubtask}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200">
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform',
                isSubtaskVisible && 'transform rotate-90',
              )}
            />
          </button>
          <span className="text-gray-700 font-medium">Subtask</span>
        </div>
        <div className="flex gap-2">
          <Sort showTasks={subtasks} setShowTasks={setSubtasks} />
          {hasEditPermission && (
            <Button
              variant="outline"
              className="border-brown font-BaiJamjuree text-sm rounded-md gap-1"
              onClick={() => {
                setIsSubtaskSectionVisible(!isSubtaskSectionVisible);
                // handleCreateSubtask();
              }}>
              <Plus className="text-brown" />
              <span className="text-brown text-sm font-BaiJamjuree">New subtask</span>
            </Button>
          )}
        </div>
      </div>

      {/* Subtask creation section */}
      {isSubtaskSectionVisible && (
        <CreateSubtask task={task} setDialog={setIsSubtaskSectionVisible} />
      )}
      {isSubtaskVisible && (
        <div className="flex flex-col space-y-1 w-full overflow-scroll">
          {subtasks.map((item) => (
            <Task
              item={item}
              onToggle={handleToggle}
              key={item.id}
              hiddenDate={true}
              expandedIds={expandedIds}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default Subtask;
