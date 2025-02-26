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
import BASE_URL, { BASE_YSWEET, type ProjectOverviewProps } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { toast } from '@/hooks/use-toast';

const cookie = getCookie('auth');
const auth = cookie?.toString() ?? '';

interface CustomJwtPayload extends JwtPayload {
  id: string;
}

export default function Blocknotes({ project_id }: ProjectOverviewProps) {
  return (
    <YDocProvider docId={project_id} authEndpoint={BASE_YSWEET}>
      <Document project_id={project_id} />
    </YDocProvider>
  );
}

function getRandomLightColor(): string {
  const getLightValue = () => Math.floor(Math.random() * 128) + 128;
  return `#${getLightValue().toString(16).padStart(2, '0')}${getLightValue().toString(16).padStart(2, '0')}${getLightValue().toString(16).padStart(2, '0')}`;
}

function Document({ project_id }: ProjectOverviewProps) {
  const [Description, setDescription] = useState<string>('');
  const [canEdit, setCanEdit] = useState<boolean>(true);

  useEffect(() => {
    const fetchDescription = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/projects/${project_id}`, {
          headers: { Authorization: auth },
        });
        if (!response.ok) {
          const errorMessage = await response.text();
          toast({
            title: `🚨 Error ${response.status}: ${response.statusText}`,
            description: errorMessage || 'An unexpected error occurred.',
            variant: 'default',
          });
          return;
        }
        const data = await response.json();
        setDescription(data.description);
        const blocks = await editor.tryParseHTMLToBlocks(data.description);
        editor.replaceBlocks(editor.document, blocks);
      } catch (error) {
        console.error('Error fetching description:', error);
      }
    };
    fetchDescription();
  }, [project_id]);

  useEffect(() => {
    if (!Description || !canEdit) return;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/projects/${project_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: auth },
          body: JSON.stringify({ description: Description }),
        });

        if (response.status === 403) {
          setCanEdit(false);
          toast({
            title: '🚨 Permission Denied',
            description: 'You no longer have permission to edit this field.',
            variant: 'destructive',
          });
        } else if (!response.ok) {
          const errorMessage = await response.text();
          toast({
            title: `🚨 Error ${response.status}: ${response.statusText}`,
            description: errorMessage || 'An unexpected error occurred.',
            variant: 'default',
          });
        }
      } catch (error) {
        console.error('Error updating description:', error);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [Description, project_id, canEdit]);

  const { audio, image, video, file, codeBlock, ...allowedBlockSpecs } = defaultBlockSpecs;
  const schema = BlockNoteSchema.create({ blockSpecs: { ...allowedBlockSpecs } });

  const userData = jwtDecode<CustomJwtPayload>(auth);
  const provider = useYjsProvider();
  const doc = useYDoc();
  const editor = useCreateBlockNote({
    schema,
    collaboration: {
      provider,
      fragment: doc.getXmlFragment('blocknote'),
      user: { color: getRandomLightColor(), name: userData.id },
    },
  });

  const onChangeBlock = async () => {
    if (!canEdit) return;
    const HTML = await editor.blocksToHTMLLossy(editor.document);
    setDescription(HTML);
  };

  return (
    <BlockNoteView
      editor={editor}
      aria-disabled={!canEdit}
      theme={'light'}
      onChange={onChangeBlock}
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
