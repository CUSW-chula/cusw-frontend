'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import BASE_URL from '@/lib/shared';
import { getCookie } from 'cookies-next';
import React from 'react';
import { useEffect, useState } from 'react';

interface BreadcrumbProps {
  task_id: string;
}

export function BreadcrumbComponent({ task_id }: BreadcrumbProps) {
  interface Task {
    id: string;
    title: string;
    project_id: string;
  }
  interface Project {
    id: string;
    title: string;
  }
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/tasks/parent-recursive/${task_id}`, {
          headers: {
            Authorization: auth,
          },
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setTasks(data);

        if (data.length > 0) {
          const projectId = data[0].projectId;
          const projectResponse = await fetch(`${BASE_URL}/projects/${projectId}`, {
            headers: {
              Authorization: auth,
            },
          });
          if (!projectResponse.ok) {
            throw new Error(`Error: ${projectResponse.statusText}`);
          }
          const projectData = await projectResponse.json();
          setProject(projectData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, [task_id, auth]);

  return (
    <div>
      <Breadcrumb className="flex flex-row">
        <BreadcrumbList className="gap-6">
          <BreadcrumbItem>
            <BreadcrumbLink
              href={`/projects/${project?.id}`}
              className="font-BaiJamjuree text-lg text-black">
              {project?.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {tasks.map((task) => (
            <React.Fragment key={task.id}>
              {<BreadcrumbSeparator />}
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/tasks/${task.id}`}
                  className="font-BaiJamjuree text-lg text-black">
                  {task.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
