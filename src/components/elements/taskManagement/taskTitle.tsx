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
        className={`w-6 h-6 mr-1 flex items-center justify-center rounded hover:bg-gray-200 ${
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
    <div className="inline-flex w-7/12 items-center">
      <Chevron task={item} />
      <div
        className="inline-flex hover:cursor-pointer items-center w-full"
        onClick={() => router.push(`/tasks/${item.id}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            router.push(`/tasks/${item.id}`);
          }
        }}
        // biome-ignore lint/a11y/useSemanticElements: <explanation>
        role="button"
        tabIndex={0}>
        <img
          src={getStatusIcon(item.status)}
          alt={`${item.status} Icon`}
          className="max-w-5 mr-2"
        />
        <div className="cursor-pointer w-full">
          <span className="flex text-black text-sm font-normal font-BaiJamjuree w-11/12">
            {item.title}
          </span>
        </div>
      </div>
    </div>
  );
};
