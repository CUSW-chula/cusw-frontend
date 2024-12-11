'use client';
import { useYDoc, useYjsProvider, YDocProvider } from '@y-sweet/react';
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
import { useEffect, useState } from 'react';
import BASE_URL, { type TaskManageMentProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';
const cookie = getCookie('auth');
const auth = cookie?.toString() ?? '';

export default function Blocknotes({ task_id }: TaskManageMentProp) {
  const docId = task_id;

  return (
    <YDocProvider docId={docId} authEndpoint="https://demos.y-sweet.dev/api/auth">
      <Document task_id={task_id} />
    </YDocProvider>
  );
}

function Document({ task_id }: TaskManageMentProp) {
  const [Description, setDescription] = useState<string>('');

  useEffect(() => {
    const fetchDescription = async () => {
      try {
        const response = await fetch(`${BASE_URL}/tasks/description/${task_id}`, {
          headers: {
            Authorization: auth,
          },
        });
        const data = await response.json();
        setDescription(data.description);
        const blocks = await editor.tryParseHTMLToBlocks(data.description);
        editor.replaceBlocks(editor.document, blocks);
      } catch (error) {
        console.error('Error fetching Description:', error);
      }
    };
    fetchDescription();
  }, [task_id]);

  useEffect(() => {
    if (!Description) return;
    const updateDescription = async () => {
      const taskId = task_id;
      const url = `${BASE_URL}/tasks/description`;
      const options = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({
          taskId,
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
  }, [Description, task_id]);

  const { audio, image, video, file, codeBlock, ...allowedBlockSpecs } = defaultBlockSpecs;
  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...allowedBlockSpecs,
    },
  });
  const provider = useYjsProvider();
  const doc = useYDoc();

  const editor = useCreateBlockNote({
    schema,
    collaboration: {
      provider,
      fragment: doc.getXmlFragment('blocknote'),
      user: { color: '#ff0000', name: 'Banyaphon Kongtham' },
    },
  });

  const onChangeBlock = async () => {
    const Markdown = await editor.blocksToHTMLLossy(editor.document);
    setDescription(Markdown);
  };

  return (
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
      <GridSuggestionMenuController triggerCharacter={':'} columns={5} minQueryLength={2} />
    </BlockNoteView>
  );
}
