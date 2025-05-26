import { useState, useEffect } from 'react';
import { TaskTitle, Money, TaskDate, Assigned, Tag, TaskActionsMenu } from './index';
import type { TaskProps } from '@/app/types/types';

// Helper functions for localStorage handling
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

export const Task = ({
  item,
  depth = 0,
  hiddenDate,
  expandedIds,
  onToggle,
  showActionsMenu = true,
}: {
  item: TaskProps;
  depth?: number;
  hiddenDate: boolean;
  expandedIds: Set<string>;
  onToggle: (taskId: string) => void;
  showActionsMenu?: boolean; // new optional prop
}) => {
  const hasChildren = item.subtasks && item.subtasks.length > 0;

  return (
    <>
      <div className="flex items-center hover:bg-gray-50">
        <div
          className="flex items-center w-full h-fit my-1.5"
          style={{ marginLeft: `${depth * 24 + 24}px` }}>
          <TaskTitle
            item={item}
            isExpanded={expandedIds.has(item.id)}
            onToggle={() => onToggle(item.id)}
          />

          <div className="w-5/12 flex relative justify-end gap-8 items-center">
            <Tag item={item} />
            <div className="flex items-center gap-2">
              <Money item={item} />
              <TaskDate item={item} hiddenDate={hiddenDate} />
              <Assigned item={item} />
            </div>
            {showActionsMenu && <TaskActionsMenu task={item} />}
          </div>
        </div>
      </div>

      {hasChildren && expandedIds.has(item.id) && (
        <div>
          {item.subtasks?.map((child) => (
            <Task
              key={child.id}
              item={child}
              depth={depth + 1}
              hiddenDate={hiddenDate}
              expandedIds={expandedIds}
              onToggle={onToggle}
              showActionsMenu={showActionsMenu} // pass down the same value
            />
          ))}
        </div>
      )}
    </>
  );
};

// Parent component that manages the expanded state
export const TaskList = ({ tasks }: { tasks: TaskProps[] }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(loadExpandedState);

  useEffect(() => {
    saveExpandedState(expandedIds);
  }, [expandedIds]);

  const handleToggle = (taskId: string) => {
    const newIds = new Set(expandedIds);
    newIds.has(taskId) ? newIds.delete(taskId) : newIds.add(taskId);
    setExpandedIds(new Set(newIds));
  };

  return (
    <div>
      {tasks.map((task) => (
        <Task
          key={task.id}
          item={task}
          depth={0}
          hiddenDate={false}
          expandedIds={expandedIds}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
};
