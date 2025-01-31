import type { TaskProps } from '@/app/types/types';
import { ChevronRight, ChevronsRight } from 'lucide-react';
import { Checkbox } from '../../ui/checkbox';
import { useRouter } from 'next/navigation';

const ICONS = {
  Unassigned: '/asset/icon/unassigned.svg',
  Assigned: '/asset/icon/assigned.svg',
  InRecheck: '/asset/icon/inrecheck.svg',
  UnderReview: '/asset/icon/underreview.svg',
  Done: '/asset/icon/done.svg',
};
const statusSections = [
  { status: 'Unassigned', displayName: 'Unassigned', icon: ICONS.Unassigned },
  { status: 'Assigned', displayName: 'Assigned', icon: ICONS.Assigned },
  { status: 'InRecheck', displayName: 'In Recheck', icon: ICONS.InRecheck },
  { status: 'UnderReview', displayName: 'Under Review', icon: ICONS.UnderReview },
  { status: 'Done', displayName: 'Done', icon: ICONS.Done },
];

interface TaskTitleProps {
  item: TaskProps;
  expandedTaskIds: Set<string>;
  setExpandedTaskIds: (prev: (set: Set<string>) => Set<string>) => void;
  isTaskSelectionActive: boolean;
  visibleExportTasks: Set<string>;
  setExportedTasks: (prev: TaskProps[]) => void;
  exportedTasks: TaskProps[];
  setVisibleExportTasks: (prev: (set: Set<string>) => Set<string>) => void;
}

export const TaskTitle = ({
  item,
  expandedTaskIds,
  setExpandedTaskIds,
  isTaskSelectionActive,
  visibleExportTasks,
  setExportedTasks,
  exportedTasks,
  setVisibleExportTasks,
}: TaskTitleProps) => {
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

    const handleChecked = async (task: TaskProps) => {
      if (!visibleExportTasks.has(task.id)) {
        recursiveCheck(task, true);
        const newSet = [...exportedTasks, task];
        setExportedTasks(newSet);
      } else {
        if (!visibleExportTasks.has(task.parentTaskId)) recursiveCheck(task, false);
        const newSet = exportedTasks.filter((item) => item !== task);
        setExportedTasks(newSet);
      }
    };

    const recursiveCheck = (task: TaskProps, goTo: boolean) => {
      setVisibleExportTasks((prev) => {
        const newSet = new Set(prev);
        goTo ? newSet.add(task.id) : newSet.delete(task.id);
        return newSet;
      });
      if (task.subtasks && task.subtasks.length >= 0) {
        task.subtasks.map((item) => {
          recursiveCheck(item, goTo);
        });
      }
    };

    return (
      <div>
        {isTaskSelectionActive ? (
          <Checkbox
            className="mr-3"
            checked={visibleExportTasks.has(task.id)}
            onCheckedChange={() => handleChecked(task)}
          />
        ) : (
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
        )}
      </div>
    );
  };

  const getStatusIcon = (status: string) => {
    const section = statusSections.find((section) => section.status === status);
    return section ? section.icon : ICONS.Unassigned; // Fallback icon if status not found
  };
  return (
    <div className="inline-flex w-7/12 items-center">
      <Chevron task={item} />
      <img src={getStatusIcon(item.status)} alt={`${item.status} Icon`} className="w-6 h-6 mr-2" />
      <div
        onClick={() => router.push(`/tasks/${item.id}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // Prevent default scroll behavior for space key
            router.push(`/tasks/${item.id}`);
          }
        }}
        className="cursor-pointer w-full">
        <span className="flex text-black text-base font-normal font-BaiJamjuree w-11/12">
          {item.title}
        </span>
      </div>
    </div>
  );
};
