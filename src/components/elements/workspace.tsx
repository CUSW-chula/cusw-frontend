'use client';
import 'yjs';
import { cache, useEffect, useState } from 'react';
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

function TitleInput({ content }: { content: string }) {
  const [editedContent, setEditedContent] = useState(content);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = e.target.value;
    setEditedContent(inputText);
  };

  return (
    <input
      className="resize-none border-none w-full outline-none pl-[54px] placeholder-gray-300 text-[30px] leading-[36px] font-semibold font-Anuphan"
      placeholder="Task Title"
      value={editedContent}
      onChange={handleInputChange}
    />
  );
}
const Workspace = () => {
  const [fileList, setFileList] = useState<Files[]>([]);

  useEffect(() => {
    const fetchFile = async () => {
      const url = 'http://localhost:4000/api/file/cm24lq0sx0001jkpdbc9lxu8x';
      const options = { method: 'GET', caches: 'no-store' };

      try {
        const response = await fetch(url, options);
        const data = await response.json();
        setFileList(data);
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchFile();
  }, []);
  // disable blocks you don't want
  const { audio, image, video, file, ...allowedBlockSpecs } = defaultBlockSpecs;

  const schema = BlockNoteSchema.create({
    blockSpecs: {
      //first pass all the blockspecs from the built in, default block schema
      ...allowedBlockSpecs,
    },
  });
  const editor = useCreateBlockNote({
    schema,
    initialContent: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '',
            styles: {},
          },
        ],
      },
    ],
  });
  const [blocks, setBlocks] = useState<Block[]>([]);
  return (
    <div className="">
      <TitleInput content={''} />
      <BlockNoteView
        editor={editor}
        theme={'light'}
        onChange={() => {
          setBlocks(editor.document);
          console.log(blocks);
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
