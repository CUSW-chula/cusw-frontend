'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Displayfile, Uploadfile } from './uploadfile';
import Emoji from './emoji';
import BASE_URL, {
  BASE_SOCKET,
  type ProjectOverviewProps,
  type TaskManageMentProp,
} from '@/lib/shared';
import { getCookie } from 'cookies-next';
import Blocknoteproject from './blocknoteproject';
import { toast } from '@/hooks/use-toast';
import { getUserRoleOnProjectTask } from '@/service/userService';
import { can } from '@/permissions/helper';

const Workspace = ({ project_id }: ProjectOverviewProps) => {
  const [Title, setTitle] = useState<string>('');
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [canEdit, setCanEdit] = useState<boolean>(true);
  const [originTitle, setOriginalTitle] = useState('');
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
        if (!response.ok) {
          const errorMessage = await response.text();
        }
        const data = await response.json();
        setTitle(data.title);
        setOriginalTitle(data.title);
      } catch (error) {
        console.error('Error fetching Title:', error);
      }
    };

    fetchTitle();
  }, [project_id, auth]);

  useEffect(() => {
    if (!Title || !Title.trim() || originTitle === Title) return;
    const timer = setTimeout(async () => {
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
          if (response.status === 403) {
            setCanEdit(false);
          } else if (!response.ok) {
            const errorMessage = await response.text();
          }
          const data = await response.json();
          setOriginalTitle(Title);
        } catch (error) {
          console.error('Error updating Title:', error);
        }
      };

      updateTitle();
    }, 1000);
    return () => clearTimeout(timer);
  }, [Title, project_id, auth]);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textAreaRef.current) {
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      textAreaRef.current.style.height = '0px';
      const scrollHeight = textAreaRef.current.scrollHeight;

      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      textAreaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [textAreaRef, Title]);

  const [hasEditPermission, setHasEditPermission] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const { projectRole, taskRole, isAdmin, isHead } = await getUserRoleOnProjectTask({
        projectId: project_id,
      });
      setHasEditPermission(can('editProjectTitle', { projectRole, taskRole, isAdmin, isHead }));
    };

    checkPermission();
  }, [project_id]);

  return (
    <div className="relative w-full">
      <label
        htmlFor="require part"
        className="text-red font-semibold text-2xl absolute left-[134px]">
        {!Title && <span>*</span>}
      </label>
      <textarea
        className="resize-none border-none w-full outline-none placeholder-gray-300 text-[30px] font-semibold font-Anuphan"
        placeholder="Task Title"
        disabled={!canEdit || !hasEditPermission}
        value={Title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
        ref={textAreaRef}
      />
      <Blocknoteproject project_id={project_id} />
    </div>
  );
};
export default Workspace;
