'use client';
import { useYDoc, useYjsProvider, YDocProvider } from '@y-sweet/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import { GridSuggestionMenuController, useCreateBlockNote } from '@blocknote/react';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
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
import BASE_URL, { BASE_YSWEET, type TaskManageMentProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { jwtDecode, type JwtPayload } from 'jwt-decode';

const cookie = getCookie('auth');
const auth = cookie?.toString() ?? '';

interface CustomJwtPayload extends JwtPayload {
  id: string;
}

interface Description {
  description: { id: string; description: string };
}

export default function Blocknotes({ description }: Description) {
  const docId = description.id;
  return (
    <YDocProvider docId={docId} authEndpoint={BASE_YSWEET}>
      <Document description={description} />
    </YDocProvider>
  );
}

function getRandomLightColor(): string {
  const getLightValue = () => Math.floor(Math.random() * 128) + 128;
  const r = getLightValue().toString(16).padStart(2, '0');
  const g = getLightValue().toString(16).padStart(2, '0');
  const b = getLightValue().toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function Document({ description }: Description) {
  const [Description, setDescription] = useState<string>('');
  const task_id = description.id;

  useEffect(() => {
    setDescription(description.description);
  }, [description.description]);

  useEffect(() => {
    if (!Description) return;
    const timer = setTimeout(async () => {
      const taskId = task_id;
      const url = `${BASE_URL}/v2/tasks/${taskId}`;
      const options = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({
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
    }, 5000); // 5-second delay

    // Cleanup the timer if Description or task_id changes
    return () => clearTimeout(timer);
  }, [Description, task_id]);

  const { audio, image, video, file, codeBlock, ...allowedBlockSpecs } = defaultBlockSpecs;
  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...allowedBlockSpecs,
    },
  });

  const getUserDataFromCookie = () => {
    const decoded = jwtDecode<CustomJwtPayload>(auth);
    return decoded;
  };

  const userData = getUserDataFromCookie();
  const provider = useYjsProvider();
  const doc = useYDoc();
  const editor = useCreateBlockNote({
    schema,
    collaboration: {
      provider,
      fragment: doc.getXmlFragment('blocknote'),
      user: { color: getRandomLightColor(), name: userData.id },
      // showCursorLabels: 'always',
    },
  });

  const onChangeBlock = async () => {
    const HTML = await editor.blocksToHTMLLossy(editor.document);
    setDescription(HTML);
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
