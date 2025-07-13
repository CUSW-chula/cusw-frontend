import type { TaskProps } from '@/app/types/types';
import { ChevronRight, ChevronsRight } from 'lucide-react';
import { statusSections } from '@/lib/taskUtils';
import { useRouter } from 'next/navigation';

interface TaskTitleProps {
  item: TaskProps;
  isExpanded: boolean;
  onToggle: (taskId: string) => void;
}

export const TaskTitle = ({ item, isExpanded, onToggle }: TaskTitleProps) => {
  const router = useRouter();

  const Chevron = ({ task }: { task: TaskProps }) => {
    const hasChildren = task.subtasks && task.subtasks.length > 0;

    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggle(task.id);
    };

    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`w-6 h-6 flex flex-shrink-0 items-center justify-center rounded-md hover:bg-gray-200 ${
          hasChildren ? 'visible' : 'invisible'
        }`}>
        {task.parentTaskId ? (
          <ChevronRight
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        ) : (
          <ChevronsRight
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        )}
      </button>
    );
  };

  const getStatusIcon = (status: string) => {
    const section = statusSections.find((section) => section.status === status);
    return section ? section.icon : '/asset/icon/unassigned.svg';
  };

  return (
    <div className="flex flex-1 w-full min-w-[200px] items-center gap-1">
      <Chevron task={item} />
      <img src={getStatusIcon(item.status)} alt={`${item.status} Icon`} className="w-5" />
      <p
        className="text-black text-sm font-normal font-BaiJamjuree w-full overflow-hidden text-ellipsis"
        onClick={() => router.push(`/tasks/${item.id}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            router.push(`/tasks/${item.id}`);
          }
        }}>
        {item.title || 'new task'}
      </p>
    </div>
  );
};
