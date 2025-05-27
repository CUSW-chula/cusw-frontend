'use client';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import BASE_URL, { type TaskManageMentOverviewProp } from '@/lib/shared';
import type { TagProps, TaskProps } from '@/app/types/types';
import { Task, ExportDialog, Filter, Sort, CreateTask } from './taskManagement';
import { parseJsonValues, statusSections } from '@/lib/taskUtils';
import { toast } from '@/hooks/use-toast';

const cookie = getCookie('auth');
const auth = cookie?.toString() ?? '';

// Helper functions for localStorage
const loadExpandedState = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  const saved = localStorage.getItem('expandedTaskIds');
  if (saved === '{}') return new Set();
  return saved ? new Set(JSON.parse(saved)) : new Set();
};

const saveExpandedState = (ids: Set<string>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('expandedTaskIds', JSON.stringify(Array.from(ids)));
  }
};

export const TaskManager = ({ project_id }: TaskManageMentOverviewProp) => {
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const [showTasks, setShowTasks] = useState<TaskProps[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(loadExpandedState);

  // Save expanded state to localStorage when it changes
  useEffect(() => {
    saveExpandedState(expandedIds);
  }, [expandedIds]);

  const handleToggle = (taskId: string) => {
    const newIds = new Set(expandedIds);
    newIds.has(taskId) ? newIds.delete(taskId) : newIds.add(taskId);
    setExpandedIds(new Set(newIds));
  };

const sortByPosition = (a: TaskProps, b: TaskProps): number => {
  // Handle cases where position is missing
  if (!a.position && !b.position) return 0;
  if (!a.position) return 1; // push items without position to the end
  if (!b.position) return -1; // push items without position to the end

  // Split positions into arrays of numbers for comparison
  const posA = a.position.split('.').map(Number);
  const posB = b.position.split('.').map(Number);

  // Compare each level of the position
  for (let i = 0; i < Math.min(posA.length, posB.length); i++) {
    // Handle NaN cases (if position contains non-numeric parts)
    if (Number.isNaN(posA[i]) || Number.isNaN(posB[i])) {
      // Compare as strings if not numbers
      const strA = a.position.split('.')[i];
      const strB = b.position.split('.')[i];
      if (strA !== strB) return strA.localeCompare(strB);
    } else if (posA[i] !== posB[i]) {
      return posA[i] - posB[i];
    }
  }

  // If one position is more specific than the other (e.g., "1" vs "1.1")
  return posA.length - posB.length;
};


  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/v2/projects/${project_id}`, {
        headers: {
          Authorization: auth,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const project = await response.json();
      setProjectName(project.title);
      
      const parsedData = parseJsonValues(project.tasks);
      
      // Recursively sort tasks and their subtasks by position
      const sortTasksRecursively = (tasks: TaskProps[]) => {
        tasks.sort(sortByPosition);
        for (const task of tasks) {
          if (task.subtasks && task.subtasks.length > 0) {
            sortTasksRecursively(task.subtasks);
          }
        }
      };
      
      sortTasksRecursively(parsedData);
      setTasks(parsedData);
      setShowTasks(parsedData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [project_id]);

  const statusToInt = (status: string): number => {
    const statusMap: { [key: string]: number } = {
      Unassigned: 1,
      Assigned: 2,
      InRecheck: 3,
      UnderReview: 4,
      Done: 5,
    };
    return statusMap[status] || -1;
  };

  const groupingStatus = (task: TaskProps, max: number): number => {
    let currentMax = Math.min(max, statusToInt(task.status));
    if (task.subtasks) {
      for (const subtask of task.subtasks) {
        currentMax = Math.min(currentMax, groupingStatus(subtask, currentMax));
      }
    }
    return currentMax;
  };

  return (
    <div className="h-auto w-full p-11 font-BaiJamjuree bg-white rounded-md border border-brown flex flex-col">
      <header className="h-9 text-black text-3xl font-semibold leading-9 mb-6">
        {projectName}
      </header>
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-4">
          <Filter tasks={tasks} setShowTasks={setShowTasks} />
          <ExportDialog tasks={tasks} />
        </div>
        <div className="flex items-center gap-4">
          <Sort showTasks={showTasks} setShowTasks={setShowTasks} />
          <CreateTask project_id={project_id} />
        </div>
      </div>
      {statusSections.map(({ status, displayName, icon }) => (
        <div key={status}>
          <div className="flex items-center gap-2 border-b border-gray-300 py-3">
            <img src={icon} alt={`${status} Icon`} className="w-6 h-6" />
            <span className="text-black text-sm font-medium font-BaiJamjuree">{displayName}</span>
          </div>
          <div className="w-full block">
            {showTasks
              .filter((item) => groupingStatus(item, 99) === statusToInt(status))
              .map((item) => (
                <Task
                  key={item.id}
                  item={item}
                  depth={0}
                  hiddenDate={false}
                  expandedIds={expandedIds}
                  onToggle={handleToggle}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
