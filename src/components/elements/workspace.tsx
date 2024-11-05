'use client';
import 'yjs';
import { useCallback, useEffect, useState } from 'react';
import { Displayfile, Uploadfile } from './uploadfile';
import Emoji from './emoji';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import { GridSuggestionMenuController, useCreateBlockNote } from '@blocknote/react';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import * as Button from '@/components/ui/button';
import * as Card from '@/components/ui/card';
import * as DropdownMenu from '@/components/ui/dropdown-menu';
import * as Form from '@/components/ui/form';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Popover from '@/components/ui/popover';
import * as Tabs from '@/components/ui/tabs';
import * as Toggle from '@/components/ui/toggle';
import * as Tooltip from '@/components/ui/tooltip';
import YPartyKitProvider from 'y-partykit/provider';
import * as Y from 'yjs';

// Sets up Yjs document and PartyKit Yjs provider.
const doc = new Y.Doc();
const provider = new YPartyKitProvider(
  'blocknote-dev.yousefed.partykit.dev',
  // Use a unique name as a "room" for your application.
  'your-project-name',
  doc,
);
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

const Workspace = () => {
  const [Title, setTitle] = useState<string>('');
  const [Description, setDescription] = useState<string>('');
  const [fileList, setFileList] = useState<Files[]>([]);

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
    const fetchDescription = async () => {
      try {
        const response = await fetch(
          'http://localhost:4000/api/tasks/description/cm24lq0sx0001jkpdbc9lxu8x',
        );
        const data = await response.json();
        setDescription(data.description);
        const blocks = await editor.tryParseHTMLToBlocks(data.description);
        editor.replaceBlocks(editor.document, blocks);
        console.log('Initial Description:', data);
      } catch (error) {
        console.error('Error fetching Description:', error);
      }
    };
    fetchDescription();
  }, []);

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const response = await fetch(
          'http://localhost:4000/api/tasks/title/cm24lq0sx0001jkpdbc9lxu8x',
        );
        const data = await response.json();
        setTitle(data.title);
        console.log('Initial Title:', data);
      } catch (error) {
        console.error('Error fetching Title:', error);
      }
    };

    fetchTitle();

    const fetchFile = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/file/cm24lq0sx0001jkpdbc9lxu8x');
        const data = await response.json();
        setFileList(data);
        console.log('Initial file list:', data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFile();
    const ws = new WebSocket('ws://localhost:3001');
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
  }, [pareJsonValue, pareJsonValues]);

  // disable blocks you don't want
  const { audio, image, video, file, codeBlock, ...allowedBlockSpecs } = defaultBlockSpecs;

  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...allowedBlockSpecs,
    },
  });

  useEffect(() => {
    if (!Title) return;
    const updateTitle = async () => {
      const taskId = 'cm24lq0sx0001jkpdbc9lxu8x';
      const userId = 'cm24ll4370008kh59coznldal';
      const url = 'http://localhost:4000/api/tasks/title';
      const options = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          userId,
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
  }, [Title]);

  useEffect(() => {
    if (!Description) return;
    const updateDescription = async () => {
      const taskId = 'cm24lq0sx0001jkpdbc9lxu8x';
      const userId = 'cm24ll4370008kh59coznldal';
      const url = 'http://localhost:4000/api/tasks/description';
      const options = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          userId,
          description: Description,
        }),
      };

      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();
        console.log('Description updated successfully:', data);
      } catch (error) {
        console.error('Error updating Description:', error);
      }
    };
    updateDescription();
  }, [Description]);

  const editor = useCreateBlockNote({
    schema,
    collaboration: {
      provider,
      fragment: doc.getXmlFragment('document-store'),
      user: {
        name: 'My Username',
        color: '#ff0000',
      },
    },
  });

  const onChangeBlock = async () => {
    const html = await editor.blocksToHTMLLossy(editor.document);
    setDescription(html);
  };

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
      <BlockNoteView
        editor={editor}
        theme={'light'}
        onChange={() => {
          onChangeBlock();
        }}
        emojiPicker={false}
        shadCNComponents={{
          Button,
          Card,
          DropdownMenu,
          Form,
          Input,
          Label,
          Popover,
          Tabs,
          Toggle,
          Tooltip,
        }}>
        <GridSuggestionMenuController
          triggerCharacter={':'}
          // Changes the Emoji Picker to only have 5 columns.
          columns={5}
          minQueryLength={2}
        />
      </BlockNoteView>

      <Displayfile fileList={fileList} setFileList={setFileList} />
      <div className="flex justify-between">
        <Emoji />
        <Uploadfile setFileList={setFileList} />
      </div>
    </div>
  );
};

export default Workspace;
