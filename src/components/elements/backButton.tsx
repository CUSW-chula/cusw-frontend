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
  const router = useRouter();
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const handleBack = async () => {
    const url = `${BASE_URL}/tasks/parent/${task_id}`;
    const options = { method: 'GET', headers: { Authorization: auth } };
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      router.push(`/tasks/${data.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button
      variant="link"
      size="sm"
      onClick={handleBack}
      className="font-BaiJamjuree bg-white border-2 border-brown text-brown text-md">
      <Redo2 className="transform rotate-180 text-brown" /> Back
    </Button>
  );
};