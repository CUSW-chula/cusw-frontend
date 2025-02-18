'use client';

import type { TaskProps } from '@/app/types/types';
import { Button } from '@/components/ui/button';
import BASE_URL from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { Redo2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';

const useAuthHeader = () => {
  const cookie = getCookie('auth');
  return cookie?.toString() ?? '';
};

const BackButton = ({ task }: { task: TaskProps }) => {
  const router = useRouter();
  const auth = useAuthHeader();

  const handleBack = async () => {
    try {
      const response = await fetch(`${BASE_URL}/v2/tasks/parent/${task.id}`, {
        method: 'GET',
        headers: { Authorization: auth },
      });

      if (!response.headers.get('content-type')?.includes('application/json')) {
        const projectId = await response.text();
        router.push(`/projects/${projectId}`);
      } else {
        const data = await response.json();
        router.push(`/tasks/${data.id}`);
      }
    } catch (error) {
      console.error('Error fetching task parent:', error);
    }
  };

  return (
    <Button
      variant="link"
      size="sm"
      onClick={handleBack}
      className="font-BaiJamjuree bg-white border-x border-y border-brown text-brown text-md">
      <Redo2 className="transform rotate-180 text-brown" /> Back
    </Button>
  );
};

const ProjectBackButton = ({ project_id }: { project_id: string }) => {
  const router = useRouter();

  return (
    <Button
      variant="link"
      size="sm"
      onClick={() => router.push(`/projects/detail/${project_id}`)}
      className="font-BaiJamjuree bg-white border-x border-y border-brown text-brown text-md">
      <Redo2 className="transform rotate-180 text-brown" /> Back
    </Button>
  );
};

export { BackButton, ProjectBackButton };
