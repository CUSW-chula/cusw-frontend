'use client';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskTitle, Money, TaskDate, Assigned, Tag, TaskActionsMenu } from './index';
import type { TaskProps } from '@/app/types/types';

export const SortableTaskItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 9999 : 0,
    touchAction: 'none',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

export const Task = ({
  item,
  depth = 0,
  hiddenDate,
  expandedIds,
  onToggle,
  showActionsMenu = true,
  onTaskDelete,
  activeId,
  forceCollapse = false,
}: {
  item: TaskProps;
  depth?: number;
  hiddenDate: boolean;
  expandedIds: Set<string>;
  onToggle: (taskId: string) => void;
  showActionsMenu?: boolean;
  onTaskDelete?: (taskId: string) => void;
  activeId?: string;
  forceCollapse?: boolean;
}) => {
  const hasChildren = item.subtasks && item.subtasks.length > 0;
  const isExpanded = forceCollapse ? false : expandedIds.has(item.id);
  const hasActiveChild = item.subtasks?.some((child) => child.id === activeId) ?? false;

  return (
    <>
      <SortableTaskItem id={item.id}>
        <div
        className="flex items-center w-full h-fit py-1.5 hover:bg-gray-50 justify-between"
        style={{ paddingLeft: `${depth * 24}px` }}>
          <TaskTitle item={item} isExpanded={isExpanded} onToggle={() => onToggle(item.id)} />

          <div className="w-fit flex items-center justify-end gap-2">
            <Tag item={item} />
            <Money item={item} />
            <TaskDate item={item} hiddenDate={hiddenDate} />
            <Assigned item={item} />
            {showActionsMenu && (
              <TaskActionsMenu task={item} onTaskDelete={() => onTaskDelete?.(item.id)} />
            )}
          </div>
        </div>
      </SortableTaskItem>

      {hasChildren && isExpanded && activeId !== item.id && (
        <div className="w-full">
          <SortableContext
            items={item.subtasks!.map((c) => c.id)}
            strategy={verticalListSortingStrategy}>
            {item.subtasks?.map((child) => (
              <Task
                key={child.id}
                item={child}
                depth={depth + 1}
                hiddenDate={hiddenDate}
                expandedIds={expandedIds}
                onToggle={onToggle}
                showActionsMenu={showActionsMenu}
                onTaskDelete={onTaskDelete}
                activeId={activeId}
                forceCollapse={hasActiveChild}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </>
  );
};
