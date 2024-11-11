'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import BASE_URL from '@/lib/shared';
import { getCookie } from 'cookies-next';
import React from 'react';
import { useEffect, useState } from 'react';

interface BreadcrumbProps {
  task_id: string;
}

async function getTitleName(taskId: string, auth: string) {
  try {
    const response = await fetch(`${BASE_URL}/tasks/title/${taskId}`, {
      headers: {
        Authorization: auth,
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.title;
  } catch (error) {
    console.error('Failed to fetch task title:', error);
    return 'Unknown';
  }
}

export function BreadcrumbComponent({ task_id }: BreadcrumbProps) {
  interface Task {
    id: string;
    title: string;
  }
  const [tasks, setTasks] = useState<Task[]>([]);
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
        console.log('data:', data);
      } catch (error) {
        console.error('Failed to fetch task titles:', error);
      }
    };
    getTitleName(task_id, auth);
    fetchData();
  }, [task_id, auth]);

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          {tasks.map((task, index) => (
            <React.Fragment key={task.id}>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/tasks/${task.id}`}
                  className="font-BaiJamjuree text-lg text-black">
                  {task.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {index < tasks.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
