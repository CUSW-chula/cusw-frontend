'use client';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import BASE_URL, { type TaskManageMentOverviewProp } from '@/lib/shared';
import type { TaskProps } from '@/app/types/types';
import { Task, ExportDialog, Filter, Sort, CreateTask } from './taskManagement';
import { parseJsonValues, statusSections } from '@/lib/taskUtils';

const cookie = getCookie('auth');
const auth = cookie?.toString() ?? '';

export const TaskManager = ({ project_id }: TaskManageMentOverviewProp) => {
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const [showTasks, setShowTasks] = useState<TaskProps[]>([]);
  const [projectName, setProjectName] = useState<string>('');

  useEffect(() => {
    //get all data of project from db
    const fetchData = async () => {
      try {
        const data = await fetch(`${BASE_URL}/v2/projects/${project_id}`, {
          headers: {
            Authorization: auth,
          },
        });
        if (data.ok) {
          const project = await data.json();
          setProjectName(project.title);

          const parsedData = parseJsonValues(project.tasks);
          setTasks(parsedData);
          setShowTasks(parsedData);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [project_id]);

  const ProjectController = () => {
    return (
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
    );
  };

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

  return (
    <div className="h-auto w-full p-11 font-BaiJamjuree bg-white rounded-md border border-brown flex flex-col">
      <header className="h-9 text-black text-3xl font-semibold leading-9 mb-6">
        {projectName}
      </header>
      <ProjectController />
      {statusSections.map(({ status, displayName, icon }) => (
        <div key={status}>
          {/* Status Title */}
          <div className="flex items-center gap-2 border-b border-gray-300 py-3">
            <img src={icon} alt={`${status} Icon`} className="w-6 h-6" />
            <span className="text-black text-sm font-medium font-BaiJamjuree">{displayName}</span>
          </div>
          {/* Tasks in there group */}
          <div className="w-full block">
            {showTasks
              .filter((item) => groupingStatus(item, 99) === statusToInt(status))
              .map((item) => (
                <Task key={item.id} item={item} hiddenDate={false} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
