'use client';
import { useCallback, useEffect, useState } from 'react';
import { Displayfile, Uploadfile } from './uploadfile';
import Emoji from './emoji';
import BASE_URL, {
  BASE_SOCKET,
  type ProjectOverviewProps,
  type TaskManageMentProp,
} from '@/lib/shared';
import { getCookie } from 'cookies-next';
import Blocknoteproject from './blocknoteproject';

const Workspace = ({ project_id }: ProjectOverviewProps) => {
  const [Title, setTitle] = useState<string>('');
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const pareJsonValues = useCallback((values: any) => {
    interface Title {
      title: string;
    }
    const newValue: Title = {
      title: values.title,
    };
    return newValue;
  }, []);

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/projects/${project_id}`, {
          headers: {
            Authorization: auth,
          },
        });
        const data = await response.json();
        setTitle(data.title);
      } catch (error) {
        console.error('Error fetching Title:', error);
      }
    };

    fetchTitle();
  }, [project_id, auth]);

  useEffect(() => {
    if (!Title) return;
    const updateTitle = async () => {
      const url = `${BASE_URL}/v2/projects/${project_id}`;
      const options = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({
          title: Title,
        }),
      };

      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();
        console.log('Title updated successfully:', data);
      } catch (error) {
        console.error('Error updating Title:', error);
      }
    };

    updateTitle();
  }, [Title, project_id, auth]);
  return (
    <div>
      <input
        className="resize-none border-none w-full outline-none pl-[54px] placeholder-gray-300 text-[30px] font-semibold font-Anuphan"
        placeholder="Task Title"
        value={Title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
      />
      <Blocknoteproject project_id={project_id} />
    </div>
  );
};
export default Workspace;
