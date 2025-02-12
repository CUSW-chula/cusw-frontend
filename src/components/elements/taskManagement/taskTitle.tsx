import type { TaskProps } from '@/app/types/types';
import { ChevronRight, ChevronsRight } from 'lucide-react';
import { statusSections } from '@/lib/taskUtils';
import { useRouter } from 'next/navigation';

export const TaskTitle = ({
  item,
  expandedTaskIds,
  setExpandedTaskIds,
}: {
  item: TaskProps;
  expandedTaskIds: Set<string>;
  setExpandedTaskIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}) => {
  const router = useRouter();
  const Chevron = ({ task }: { task: TaskProps }) => {
    const hasChildren = task.subtasks && task.subtasks.length > 0;
    const isExpanded = expandedTaskIds.has(task.id);
    //expand subtask
    const toggleExpand = (id: string) => {
      setExpandedTaskIds((prev) => {
        const newSet = new Set(prev);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        return newSet;
      });
    };

    return (
      <button
        type="button"
        onClick={() => toggleExpand(task.id)}
        className={`w-6 h-6 mr-1 flex items-center justify-center rounded hover:bg-gray-200 ${
          hasChildren ? 'visible' : 'invisible'
        }`}>
        {task.parentTaskId ? (
          <ChevronRight
            className={`h-4 w-4 transition-transform${isExpanded ? 'transform rotate-90' : ''}`}
          />
        ) : (
          <ChevronsRight
            className={`h-4 w-4 transition-transform${isExpanded ? 'transform rotate-90' : ''}`}
          />
        )}
      </button>
    );
  };

  const getStatusIcon = (status: string) => {
    const section = statusSections.find((section) => section.status === status);
    return section ? section.icon : '/asset/icon/unassigned.svg'; // Fallback icon if status not found
  };
  return (
    <div className="inline-flex w-7/12 items-center">
      <Chevron task={item} />
      <div
        className="inline-flex hover:cursor-pointer items-center w-full"
        onClick={() => router.push(`/tasks/${item.id}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // Prevent default scroll behavior for space key
            router.push(`/tasks/${item.id}`);
          }
        }}>
        <img
          src={getStatusIcon(item.status)}
          alt={`${item.status} Icon`}
          className="w-6 h-6 mr-2"
        />
        <div className="cursor-pointer w-full">
          <span className="flex text-black text-base font-normal font-BaiJamjuree w-11/12">
            {item.title}
          </span>
        </div>
      </div>
    </div>
  );
};
