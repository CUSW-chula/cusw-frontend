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
import type { TaskProps } from '@/app/types/types';

export function BreadcrumbComponent({ task }: { task: TaskProps }) {
  interface Project {
    id: string;
    title: string;
  }
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/tasks/parent-recursive/${task.id}`, {
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
          const projectResponse = await fetch(`${BASE_URL}/v2/projects/${projectId}`, {
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
  }, [task.id, auth]);

  return (
    <div>
      <Breadcrumb className="flex flex-row">
        <BreadcrumbList className="gap-1 sm:gap-1">
          <BreadcrumbItem>
            <BreadcrumbLink
              href={`/projects/${project?.id}`}
              className="font-BaiJamjuree text-[14px] text-black">
                {project?.title && project.title.length > 20 ? (
                <span title={project.title}>{project.title.substring(0, 20)}...</span>
                ) : (
                project?.title
                )}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {tasks.map((task) => (
            <React.Fragment key={task.id}>
              {<BreadcrumbSeparator />}
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/tasks/${task.id}`}
                  className="font-BaiJamjuree text-[14px] text-black ">
                    {task.title.length > 20 ? (
                    <span title={task.title}>{task.title.substring(0, 20)}...</span>
                    ) : (
                    task.title
                    )}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
