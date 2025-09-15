'use client';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import BASE_URL, { type TaskManageMentOverviewProp } from '@/lib/shared';
import type { TagProps, TaskProps } from '@/app/types/types';
import { Task, ExportDialog, Filter, Sort, CreateTask } from './taskManagement';
import { parseJsonValues, statusSections } from '@/lib/taskUtils';
import { toast } from '@/hooks/use-toast';
import { jwtDecode } from 'jwt-decode';

const cookie = getCookie('auth');
const auth = cookie?.toString() ?? '';

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

export const MyTaskManager = () => {
  const [showTasks, setShowTasks] = useState<TaskProps[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(loadExpandedState);
  const [userProjects, setUserProjects] = useState<{ id: string; role: string }[]>([]);

  const handleToggle = (taskId: string) => {
    const newIds = new Set(expandedIds);
    newIds.has(taskId) ? newIds.delete(taskId) : newIds.add(taskId);
    setExpandedIds(new Set(newIds));
  };

  useEffect(() => {
    saveExpandedState(expandedIds);
  }, [expandedIds]);

  useEffect(() => {
    if (!auth) {
      console.error('No auth token found');
      return;
    }

    try {
      const decoded = jwtDecode<{ id: string }>(auth);
      const userId = decoded.id;

      const fetchUserProjects = async () => {
        try {
          const response = await fetch(`${BASE_URL}/v2/users/userrole/${userId}`, {
            headers: { Authorization: auth },
          });
          if (!response.ok) {
            console.error('Failed to fetch user projects');
            return;
          }
          const data = await response.json();
          // Ensure data.projects exists and is an array
          if (data?.projects && Array.isArray(data.projects)) {
            setUserProjects(data.projects);
          } else {
            console.error('Invalid user projects data structure:', data);
            setUserProjects([]);
          }
        } catch (error) {
          console.error('Error fetching user projects:', error);
          setUserProjects([]);
        }
      };

      const fetchTask = async () => {
        try {
          const response = await fetch(`${BASE_URL}/v2/tasks/user/${userId}`, {
            headers: { Authorization: auth },
          });
          if (!response.ok) {
            const errorMessage = await response.text();
            console.error('Failed to fetch tasks:', errorMessage);
            return;
          }
          const data = await response.json();
          if (Array.isArray(data)) {
            const parsedData = parseJsonValues(data);
            const testja = parsedData.map((task) => ({
              ...task,
              subtasks: undefined,
            }));
            setShowTasks(testja);
          } else {
            console.error('Invalid tasks data structure:', data);
            setShowTasks([]);
          }
        } catch (error) {
          console.error('Error fetching tasks:', error);
          setShowTasks([]);
        }
      };

      fetchUserProjects();
      fetchTask();
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      toast({
        title: 'Authentication Error',
        description: 'Please log in again.',
        variant: 'destructive',
      });
    }
  }, []);

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
      currentMax = task.subtasks.reduce((acc, subtask) => {
        return Math.min(acc, groupingStatus(subtask, currentMax));
      }, currentMax);
    }

    return currentMax;
  };

  // กรอง tasks ที่ user ยังคงเป็น project member
  const filteredTasks = showTasks.filter((task) => {
    return userProjects.some((project) => project.id === task.projectId);
  });

  return (
    <div className="h-auto w-full p-11 font-BaiJamjuree bg-white rounded-md border border-brown flex flex-col">
      <header className="h-9 text-black text-3xl font-semibold leading-9 mb-6">My Task</header>
      {statusSections.map(({ status, displayName, icon }) => (
        <div key={status}>
          {/* Status Title */}
          <div className="flex items-center gap-2 border-b border-gray-300 py-3">
            <img src={icon} alt={`${status} Icon`} className="w-6 h-6" />
            <span className="text-black text-sm font-medium font-BaiJamjuree">{displayName}</span>
          </div>
          {/* Tasks in there group */}
          <div className="w-full block">
            {filteredTasks
              .filter((item) => groupingStatus(item, 99) === statusToInt(status))
              .map((item) => (
                <Task
                  key={item.id}
                  item={item}
                  hiddenDate={false}
                  expandedIds={expandedIds}
                  onToggle={handleToggle}
                  showActionsMenu={false}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
