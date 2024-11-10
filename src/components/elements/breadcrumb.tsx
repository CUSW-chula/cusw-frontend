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

function useBreadcrumbTitles(taskId: string, auth: string) {
  const [titles, setTitles] = useState<string[]>([]);

  useEffect(() => {
    async function fetchTitle() {
      const title = await getTitleName(taskId, auth);
      const storedTitles = JSON.parse(localStorage.getItem('breadcrumbTitles') || '[]');
      storedTitles.push(title);
      localStorage.setItem('breadcrumbTitles', JSON.stringify(storedTitles));
      setTitles(storedTitles);
    }

    fetchTitle();
  }, [taskId, auth]);

  return titles;
}

export function BreadcrumbComponent() {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const taskId = 'your-task-id'; // Replace with actual task ID
  const titles = useBreadcrumbTitles(taskId, auth);

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Project title</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {titles.map((title) => (
            <React.Fragment key={title}>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/components/${title}`}>{title}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
