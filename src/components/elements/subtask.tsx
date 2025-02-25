'use client';
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { type Block, BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import { getCookie } from 'cookies-next';
import BASE_URL, { BASE_SOCKET } from '@/lib/shared';
import { Sort, Task } from './taskManagement';
import type { TaskProps } from '@/app/types/types';
import { CreateSubtask } from './createSubtask';

const Subtask = ({ task }: { task: TaskProps }) => {
  const [isSubtaskSectionVisible, setIsSubtaskSectionVisible] = useState(false);
  const [isSubtaskVisible, setIsSubtaskVisible] = useState(false);
  const [subtasks, setSubtasks] = useState<TaskProps[]>([]);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  useEffect(() => {
    try {
      setSubtasks(task.subtasks ?? []);
      task.subtasks?.map((item) => {});
    } catch (error) {
      console.error('Error');
    }
  }, []);

  const handleToggleSubtask = () => {
    setIsSubtaskVisible(!isSubtaskVisible);
  };

  const { audio, image, video, file, ...allowedBlockSpecs } = defaultBlockSpecs;


  return (
    <div>
      <div className="flex items-center py-1">
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
        <div className="flex-grow" />
        <div className="relative">
              <Sort showTasks={subtasks} setShowTasks={setSubtasks} />
        </div>
        <Button
          variant="outline"
          className="ml-3 flex items-center text-[#6b5c56] border-[#6b5c56] px-3 py-1 rounded-md"
          onClick={() => {
            setIsSubtaskSectionVisible(!isSubtaskSectionVisible);
            // handleCreateSubtask();
          }}>
          + Add Subtask
        </Button>
      </div>

      {/* Subtask creation section */}
      {isSubtaskSectionVisible && (
        <CreateSubtask task={task} setDialog={setIsSubtaskSectionVisible} />
      )}
      {isSubtaskVisible && (
        <div className="w-full space-y-1">
          {subtasks.map((item) => (
            <Task item={item} key={item.id} hiddenDate={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Subtask;
