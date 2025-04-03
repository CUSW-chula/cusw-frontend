import type React from 'react';
import { useEffect, useState } from 'react';
import BASE_URL, { type Tag } from '@/lib/shared';
import { Switch } from '@/components/ui/switch';
import { getCookie } from 'cookies-next';
import { toast } from '@/hooks/use-toast';

interface ManageProps {
  tag: Tag;
}

const Manage: React.FC<ManageProps> = ({ tag }) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [isProject, setIsProject] = useState<boolean>(tag.isProject);

  const updateTag = async (select: boolean) => {
    const tagid = tag.id;
    const url = `${BASE_URL}/v2/tags/${tagid}`;
    const options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({
        name: tag.name,
        isProject: select,
      }),
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      const errorMessage = await response.text();
      toast({
        title: `🚨 Error ${response.status}: ${response.statusText}`,
        description: `🔥 error: ${errorMessage || 'An unexpected error occurred.'}🗂️ file: manage.tsx`,
        variant: 'default',
      });
    }
  };

  return (
    <select
      value={isProject ? 'project' : 'task'}
      onChange={(e) => {
        const value = (e.target as HTMLSelectElement).value === 'project';
        updateTag(value);
        setIsProject(value);
      }}>
      <option value="task">Task</option>
      <option value="project">Project</option>
    </select>
  );
};

export default Manage;
