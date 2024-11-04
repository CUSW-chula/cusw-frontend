'use client';
import 'yjs';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Displayfile, Uploadfile } from './uploadfile';
import Emoji from './emoji';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { type Block, BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
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

interface Textedit {
  title: string;
  description: string;
}
const Workspace = () => {
  const [TexteditList, setTexteditList] = useState<Textedit | null>(null);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const pareJsonValues = useCallback((values: any) => {
    const newValue: Textedit = {
      title: values.title,
      description: values.description,
    };
    return newValue;
  }, []);

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

  useEffect(() => {
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
    const fetchTextedit = async () => {
      try {
        const response = await fetch(
          'http://localhost:4000/api/tasks/textedit/cm24lq0sx0001jkpdbc9lxu8x',
        );
        const data = await response.json();
        setTexteditList(data);
        console.log('Initial Textedit list:', data);
      } catch (error) {
        console.error('Error fetching Textedit:', error);
      }
    };

    fetchTextedit();

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
        } else if (eventName === '') {
          setTexteditList(parsedDatas);
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
  }, [pareJsonValue]);

  // disable blocks you don't want
  const { audio, image, video, file, codeBlock, ...allowedBlockSpecs } = defaultBlockSpecs;

  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...allowedBlockSpecs,
    },
  });

  const handleTextingActions = useCallback(async () => {
    if (!TexteditList) return;
    const taskId = 'cm24lq0sx0001jkpdbc9lxu8x';
    const userId = 'cm24ll4370008kh59coznldal';
    const url = 'http://localhost:4000/api/tasks/textedit';
    const options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId,
        userId,
        title: TexteditList.title,
        description: TexteditList.description,
      }),
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const data = await response.json();
      console.log('Textedit updated successfully:', data);
    } catch (error) {
      console.error('Error updating textedit:', error);
    }
  }, [TexteditList]);

  //patch when textedit was update
  useEffect(() => {
    if (TexteditList) {
      handleTextingActions();
    }
  }, [TexteditList, handleTextingActions]);

  const editor = useCreateBlockNote({
    schema,
  });

  //set texteditList from DB
  const onChangeBlock = async () => {
    const html = await editor.blocksToHTMLLossy(editor.document);
    setTexteditList((prev) => (prev ? { ...prev, description: JSON.stringify(html) } : null));
  };
  const [initialHTML, setInitialHTML] = useState<string>('');
  const hasRunRef = useRef(false); // Ref to track if the effect has run

  useEffect(() => {
    // Set initialHTML state when the component mounts
    const rawDescription = TexteditList?.description || '';

    // Clean the string: remove backslashes and escaped quotes
    const cleanedDescription = rawDescription
      .replace(/\\\"/g, '"') // Replace escaped quotes with regular quotes
      .replace(/\\/g, '') // Remove all backslashes
      .replace(/^\"|\"$/g, '');

    setInitialHTML(cleanedDescription);
  }, [TexteditList]); // Optional: To update initialHTML if TexteditList changes

  useEffect(() => {
    const loadInitialHTML = async () => {
      if (editor && initialHTML) {
        // Ensure it runs only once
        hasRunRef.current = true; // Prevent further runs

        try {
          const blocks = await editor.tryParseHTMLToBlocks(initialHTML);
          await editor.replaceBlocks(editor.document, blocks);
          console.log('this initialHTML', initialHTML);
          console.log('this document', editor.document);
        } catch (error) {
          console.error('Failed to load initial HTML:', error);
        }
      }
    };

    loadInitialHTML(); // Call the function
  }, [editor, initialHTML]);

  return (
    <div>
      <input
        className="resize-none border-none w-full outline-none pl-[54px] placeholder-gray-300 text-[30px] leading-[36px] font-semibold font-Anuphan"
        placeholder="Task Title"
        value={TexteditList?.title || ''}
        onChange={(e) =>
          setTexteditList((prev) => (prev ? { ...prev, title: e.target.value } : null))
        }
      />
      <BlockNoteView
        editor={editor}
        emojiPicker={false}
        theme={'light'}
        onChange={() => {
          onChangeBlock();
          console.log('This is onchage', editor.document);
        }}
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
        }}
      />

      <Displayfile fileList={fileList} setFileList={setFileList} />
      <div className="flex justify-between">
        <Emoji />
        <Uploadfile setFileList={setFileList} />
      </div>
    </div>
  );
};

export default Workspace;
