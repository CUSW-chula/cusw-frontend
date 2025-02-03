'use client';

import { Button } from '@/components/ui/button';
import BASE_URL from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { Redo2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';

interface BackButtonProps {
  task_id: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ task_id }) => {
  const cookie = getCookie('auth');
  const router = useRouter();
  const auth = cookie?.toString() ?? '';
  const handleBack = async () => {
    const url = `${BASE_URL}/v2/tasks/parent/${task_id}`;
    const options = { method: 'GET', headers: { Authorization: auth } };
    try {
      const response = await fetch(url, options);
      if (!response.headers.get('content-type')?.includes('application/json')) {
        const stringdata = await response.text();
        router.push(`/projects/${stringdata}`);
      } else {
        const data = await response.json();
        router.push(`/tasks/${data.id}`);
      }
    } catch (error) {
      console.error(error);
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

export const ProjectBackButton: React.FC = () => {
  const router = useRouter();

  const handleBackProject = async () => {
    router.push('/projects');
  }
  return (
    <Button
      variant="link"
      size="sm"
      onClick={handleBackProject}
      className="font-BaiJamjuree bg-white border-x border-y border-brown text-brown text-md">
      <Redo2 className="transform rotate-180 text-brown" /> Back
    </Button>
  );
}