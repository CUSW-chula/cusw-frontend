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
import BASE_URL, { BASE_YSWEET, Task, type TaskManageMentProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { toast } from '@/hooks/use-toast';
import { getUserRoleOnProjectTask } from '@/service/userService';
import { TaskProps } from '@/app/types/types';

const cookie = getCookie('auth');
const auth = cookie?.toString() ?? '';

interface CustomJwtPayload extends JwtPayload {
  id: string;
}

export default function Blocknotes({ task }: { task: TaskProps }) {
  const docId = task.id;
  return (
    <YDocProvider docId={docId} authEndpoint={BASE_YSWEET}>
      <Document task={task} />
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

const Document = ({ task }: { task: TaskProps }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const userData = getUserDataFromCookie();

  useEffect(() => {
    let isMounted = true;
    const fetchName = async () => {
      try {
        const name = await getName(userData.id, auth);
        if (isMounted) setUserName(name);
      } catch (error) {
        console.error('Failed to fetch user name:', error);
        if (isMounted) setUserName('Anonymous');
      }
    };

    fetchName();
    return () => {
      isMounted = false;
    };
  }, [userData.id]);

  if (!userName) {
    return <div className="p-4 text-muted-foreground">Initializing editor...</div>;
  }

  return <EditorWithName userName={userName} task={task} />;
};

function EditorWithName({ userName, task }: { userName: string; task: TaskProps }) {
  const [Description, setDescription] = useState('');
  const [originalDescription, setOriginalDescription] = useState<string>(task.description);
  useEffect(() => {
    const replaceBlocks = async () => {
      const blocks = await editor.tryParseHTMLToBlocks(task.description);
      editor.replaceBlocks(editor.document, blocks);
      setDescription(task.description);
    };

    replaceBlocks();
  }, [task.description]);

  useEffect(() => {
    if (!Description || originalDescription === Description) return;
    const timer = setTimeout(async () => {
      const url = `${BASE_URL}/v2/tasks/${task.id}`;
      const options = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({
          description: Description,
        }),
      };

      try {
        const response = await fetch(url, options);
        setOriginalDescription(Description);
        if (!response.ok) {
          const errorMessage = await response.text();
        }
      } catch (error) {
        console.error('Error updating Description:', error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [Description, task.id]);

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
      user: { color: getRandomLightColor(), name: userName },
    },
  });

  const onChangeBlock = async () => {
    const HTML = await editor.blocksToHTMLLossy(editor.document);
    setDescription(HTML);
  };
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const checkPermissions = async () => {
    try {
      const { role, isAdmin } = await getUserRoleOnProjectTask({
        projectId: task.projectId,
        taskId: task.id,
      });

      if (!role) {
        setHasEditPermission(false);
        return;
      }

      setHasEditPermission(!isAdmin || ['ProjectOwner', 'owner', 'assignee'].includes(role));
    } catch (error) {
      console.error('Failed to check permissions:', error);
      setHasEditPermission(false);
    }
  };
  useEffect(() => {
    checkPermissions();
  }, [task]);

  return (
    <BlockNoteView
      editable={!hasEditPermission}
      editor={editor}
      theme={'light'}
      onChange={onChangeBlock}
      emojiPicker={false}
      shadCNComponents={{
        Card,
        DropdownMenu,
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

function getUserDataFromCookie(): CustomJwtPayload {
  return jwtDecode<CustomJwtPayload>(auth);
}

async function getName(authorId: string, auth: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/v2/users/${authorId}`, {
      headers: {
        Authorization: auth,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.name || 'Anonymous';
  } catch (error) {
    console.error('Failed to fetch user name:', error);
    return 'Anonymous';
  }
}
