import { TaskTitle, Money, TaskDate, Assigned, Tag } from './index';
import { useState } from 'react';
import type { TaskProps } from '@/app/types/types';

export const Task = ({
  item,
  depth = 0,
  hiddenDate,
}: { item: TaskProps; depth?: number; hiddenDate: boolean }) => {
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set()); //Set of taskID that have been expanded
  const hasChildren = item.subtasks && item.subtasks.length > 0;
  return (
    <>
      <div className="flex items-center hover:bg-gray-50">
        <div
          className="flex items-center w-full h-fit my-1.5"
          style={{ marginLeft: `${depth * 24 + 24}px` }}>
          <TaskTitle
            item={item}
            expandedTaskIds={expandedTaskIds}
            setExpandedTaskIds={setExpandedTaskIds}
          />

          <div className="w-5/12 flex gap-1 relative justify-end items-center">
            <Tag item={item} />
            <Money item={item} />
            <Assigned item={item} />
            <TaskDate item={item} hiddenDate={hiddenDate} />
          </div>
        </div>
      </div>

      {hasChildren && expandedTaskIds.has(item.id) && (
        <div>
          {item.subtasks?.map((child) => (
            <Task
              key={child.id}
              item={child}
              depth={depth + 1} // Increase depth for child tasks
              hiddenDate={hiddenDate}
            />
          ))}
        </div>
      )}
    </>
  );
};
