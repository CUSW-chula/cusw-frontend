'use client';
import { useCallback, useEffect, useState } from 'react';
import { Displayfile, Uploadfile } from './uploadfile';
import Emoji from './emoji';
import BASE_URL, { BASE_SOCKET, type TaskManageMentProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import Blocknotes from './blocknote';
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

const Workspace = ({ task_id }: TaskManageMentProp) => {
  const [Title, setTitle] = useState<string>('');
  const [fileList, setFileList] = useState<Files[]>([]);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

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
    const fetchTitle = async () => {
      try {
        const response = await fetch(`${BASE_URL}/tasks/title/${task_id}`, {
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
  }, [task_id, auth]);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await fetch(`${BASE_URL}/file/${task_id}`, {
          headers: {
            Authorization: auth,
          },
        });
        const data = await response.json();
        setFileList(data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFile();
    const ws = new WebSocket(BASE_SOCKET);
    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

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
        } else if (eventName === 'title edited') {
          setTitle(parsedDatas.title);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, [pareJsonValue, pareJsonValues, task_id, auth]);

  useEffect(() => {
    if (!Title) return;
    const updateTitle = async () => {
      const taskId = task_id;
      const url = `${BASE_URL}/tasks/title`;
      const options = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({
          taskId,
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
  }, [Title, task_id, auth]);
  return (
    <div>
      <input
        className="resize-none border-none w-full outline-none pl-[54px] placeholder-gray-300 text-[30px] leading-[36px] font-semibold font-Anuphan"
        placeholder="Task Title"
        value={Title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
      />
      <Blocknotes task_id={task_id} />
      <Displayfile fileList={fileList} setFileList={setFileList} />
      <div className="flex justify-between">
        <Emoji task_id={task_id} />
        <Uploadfile task_id={task_id} />
      </div>
    </div>
  );
};
export default Workspace;
