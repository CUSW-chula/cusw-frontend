'use client';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import BASE_URL, { type TaskManageMentOverviewProp, type Project } from '@/lib/shared';
import type { TagProps, TaskProps } from '@/app/types/types';
import { Task, ExportDialog, Filter, Sort, CreateTask } from './taskManagement';
import { groupingStatus, parseJsonValues, statusSections, statusToInt } from '@/lib/taskUtils';
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
  const [project, setProject] = useState<Project | null>(null);
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
        setProject(project);
        setProjectName(project.title);

        const parsedData = parseJsonValues(project.tasks);
        setTasks(parsedData);
        setShowTasks(parsedData);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [project_id]);

  return (
    <div className="h-auto w-full p-11 font-BaiJamjuree bg-white rounded-md border border-brown flex flex-col">
      <header className="text-black text-3xl font-Anuphan font-semibold leading-9 mb-6 break-words whitespace-normal">
        {projectName}
      </header>
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-4">
          <Filter tasks={tasks} setShowTasks={setShowTasks} />
          <ExportDialog tasks={tasks} />
        </div>
        <div className="flex items-center gap-4">
          <Sort showTasks={showTasks} setShowTasks={setShowTasks} />
          {project && <CreateTask project={project} />}
        </div>
      </div>
      {statusSections.map(({ status, displayName, icon }) => (
        <div key={status} className="w-full">
          <div className="flex items-center gap-2 border-b border-gray-300 py-3">
            <img src={icon} alt={`${status} Icon`} className="w-6 h-6" />
            <span className="text-black text-sm font-medium font-BaiJamjuree">{displayName}</span>
          </div>
          <div className="w-full block overflow-x-auto">
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
