'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Displayfile } from './uploadfile';
import BASE_URL, { BASE_SOCKET } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import Blocknotes from './blocknote';
import { toast } from '@/hooks/use-toast';
import type { TaskProps } from '@/app/types/types';
import { getUserRoleOnProjectTask } from '@/service/userService';
import { can } from '@/permissions/helper';
interface Files {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  taskId: string;
  projectId: string;
  uploadedBy: string;
  createdAt: Date;
}
interface Workspace {
  workspace: {
    id: string;
    title: string;
    description: string;
  };
}

interface Description {
  id: string;
  description: string;
}

const Workspace = ({ task }: { task: TaskProps }) => {
  const [Title, setTitle] = useState<string>('');
  const [fileList, setFileList] = useState<Files[]>([]);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const task_id = task.id;
  const [originTitle, setOriginalTitle] = useState('');
  useEffect(() => {
    setOriginalTitle(task.title);
    setTitle(task.title);
  }, [task.title]);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const pareJsonValue = useCallback((values: any) => {
    const newValue: Files = {
      id: values.id,
      createdAt: values.createdAt,
      fileName: values.fileName,
      filePath: values.filePath,
      fileSize: values.fileSize,
      projectId: values.projectId,
      taskId: values.taskId,
      uploadedBy: values.uploadBy,
    };
    return newValue;
  }, []);
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
    const fetchFile = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/file/${task_id}`, {
          headers: {
            Authorization: auth,
          },
        });
        if (!response.ok) {
          const errorMessage = await response.text();
        }
        const data = await response.json();
        setFileList(data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFile();
    const ws = new WebSocket(BASE_SOCKET);
    ws.onopen = () => {};

    ws.onmessage = (event) => {
      try {
        const socketEvent = JSON.parse(event.data);
        const { eventName, data } = socketEvent;
        const parsedData = pareJsonValue(data);
        const parsedDatas = pareJsonValues(data);
        if (eventName === 'add-file') {
          setFileList((prevFiles) => [...prevFiles, parsedData]);
        } else if (eventName === 'remove-file') {
          setFileList((prevFiles) => prevFiles.filter((file) => file.id !== parsedData.id));
        } else if (eventName === `title:${task_id}`) {
          // setTitle(parsedDatas.title);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {};

    return () => {
      ws.close();
    };
  }, [pareJsonValue, pareJsonValues, task_id, auth]);

  useEffect(() => {
    if (!Title || !Title.trim() || originTitle === Title) return;
    const timer = setTimeout(async () => {
      const taskId = task_id;
      const url = `${BASE_URL}/v2/tasks/${taskId}`;
      const options = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({
          title: Title,
        }),
      };

      try {
        const response = await fetch(url, options);
        setOriginalTitle(Title);
        if (!response.ok) {
          const errorDetails = await response.text();
          throw new Error(
            `Error: ${response.status} - ${response.statusText}, Details: ${JSON.stringify(errorDetails)}`,
          );
        }
        const data = await response.json();
      } catch (error) {
        console.error('Error updating Title:', error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [Title, task_id, auth]);

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
        projectId: task.projectId,
        taskId: task.id,
      });
      setHasEditPermission(can('editTitle', { projectRole, taskRole, isAdmin, isHead }));
    };

    checkPermission();
  }, [task.projectId, task.id]);
  return (
    <div className="relative w-full">
      <label
        htmlFor="require part"
        className="text-red font-semibold text-2xl absolute left-[134px]">
        {!Title && <span>*</span>}
      </label>
      <textarea
        disabled={!hasEditPermission}
        className="resize-none border-none w-full outline-none placeholder-gray-300 text-[30px] font-semibold font-Anuphan"
        placeholder="Task Title"
        value={Title}
        onChange={(e) => {
          if (e.target.value.includes(',')) {
            toast({
              title: '⚠️ Invalid Character',
              description: 'Title cannot contain commas.',
            });
            return;
          }
          setTitle(e.target.value);
        }}
        ref={textAreaRef}
      />
      <Blocknotes task={task} />
      <Displayfile fileList={fileList} setFileList={setFileList} />
    </div>
  );
};
export default Workspace;
