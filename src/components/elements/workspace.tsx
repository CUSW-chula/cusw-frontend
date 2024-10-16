'use client';
import 'yjs';
import { useState } from 'react';
import { Displayfile, Uploadfile } from './uploadfile';
import Emoji from './emoji';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import {
  type DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from '@blocknote/react';
import { type BlockNoteEditor, filterSuggestionItems } from '@blocknote/core';
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
import type { Block } from '@blocknote/core';

interface Files {
  id: string;
  name: string;
  filePath: string;
  fileSize: number;
  taskId: string;
  projectId: string;
  uploadedBy: string;
  uploadedAt: Date;
  createdAt: Date;
}

const getCustomSlashMenuItems = (editor: BlockNoteEditor): DefaultReactSuggestionItem[] => {
  const allItems = getDefaultReactSlashMenuItems(editor);
  const itemsToRemove = ['Image', 'Video', 'Audio', 'File'];
  const filteredItems = allItems.filter((item) => !itemsToRemove.includes(item.title));
  return [...filteredItems];
};

const Workspace = () => {
  const [fileList, setFileList] = useState<Files[]>([]);
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: 'heading',
        content: [
          {
            type: 'text',
            text: 'Add Title',
            styles: {},
          },
        ],
        props: { level: 2 },
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'add description',
            styles: {},
          },
        ],
      },
    ],
  });
  const [blocks, setBlocks] = useState<Block[]>([]);

  return (
    <div className="">
      <BlockNoteView
        editor={editor}
        theme={'light'}
        slashMenu={false}
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
        }}>
        <SuggestionMenuController
          triggerCharacter={'/'}
          getItems={async (query) => filterSuggestionItems(getCustomSlashMenuItems(editor), query)}
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
