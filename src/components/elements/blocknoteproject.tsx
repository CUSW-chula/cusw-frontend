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
  return `#${getLightValue().toString(16).padStart(2, '0')}${getLightValue()
    .toString(16)
    .padStart(2, '0')}${getLightValue().toString(16).padStart(2, '0')}`;
}

function Document({ project_id }: ProjectOverviewProps) {
  const [Description, setDescription] = useState<string>('');
  const [canEdit, setCanEdit] = useState<boolean>(false); // read-only จนกว่าจะตรวจสิทธิ์เสร็จ
  const [originalDescription, setOriginalDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { audio, image, video, file, codeBlock, ...allowedBlockSpecs } = defaultBlockSpecs;
  const schema = BlockNoteSchema.create({
    blockSpecs: { ...allowedBlockSpecs },
  });

  // ป้องกัน token ผิดรูป
  let userName = 'anonymous';
  try {
    const userData = jwtDecode<CustomJwtPayload>(auth || '');
    if (userData?.id) userName = userData.id;
  } catch {
    // ignore invalid token
  }

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

  // โหลดข้อมูล + ตรวจสิทธิ์ โดยไม่แก้ไขข้อมูลจริง
  useEffect(() => {
    if (!editor) return;

    const load = async () => {
      setIsLoading(true);
      try {
        // 1) ดึงข้อมูลโปรเจกต์
        const res = await fetch(`${BASE_URL}/v2/projects/${project_id}`, {
          headers: { Authorization: auth },
        });
        if (!res.ok) {
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        const desc = data?.description ?? '';
        setDescription(desc);
        setOriginalDescription(desc);

        // sync เนื้อหาเข้า editor
        try {
          const blocks = await editor.tryParseHTMLToBlocks(desc);
          editor.replaceBlocks(editor.document, blocks);
        } catch {
          // ถ้า parse ไม่ได้ ปล่อยว่าง
        }

        // 2) ตัดสินสิทธิ์แก้ไขจาก response หรือ OPTIONS
        let allowed = false;

        // กรณี API มี flag สิทธิ์
        if (typeof data?.permissions?.can_edit === 'boolean') {
          allowed = data.permissions.can_edit;
        } else if (typeof data?.can_edit === 'boolean') {
          allowed = data.can_edit;
        } else if (data?.role && ['owner', 'editor', 'maintainer', 'admin'].includes(data.role)) {
          allowed = true;
        } else {
          // Fallback: ใช้ OPTIONS เพื่อดูว่ามี PATCH ไหม (ไม่แก้ไขข้อมูล)
          try {
            const opt = await fetch(`${BASE_URL}/v2/projects/${project_id}`, {
              method: 'OPTIONS',
              headers: { Authorization: auth },
            });
            const allow = opt.headers.get('Allow') || opt.headers.get('allow') || '';
            if (allow.toUpperCase().includes('PATCH')) allowed = true;
          } catch {
            // ถ้าเช็คไม่ได้ ให้คงเป็น read-only
          }
        }

        setCanEdit(allowed);
      } catch (e) {
        console.error('Error fetching description:', e);
        setCanEdit(false);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [project_id, editor]);

  // บันทึกอัตโนมัติเมื่อแก้ไข (เฉพาะเมื่อมีสิทธิ์เท่านั้น)
  useEffect(() => {
    if (!Description || !canEdit || originalDescription === Description) return;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/projects/${project_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: auth },
          body: JSON.stringify({ description: Description }),
        });

        if (response.status === 403) {
          setCanEdit(false);
          // ย้อนกลับไปเป็นค่าก่อนหน้า
          setDescription(originalDescription);
          try {
            const blocks = await editor.tryParseHTMLToBlocks(originalDescription);
            editor.replaceBlocks(editor.document, blocks);
          } catch {}
          return;
        }

        if (!response.ok) {
          const text = await response.text();
          console.error('Error updating description:', text);
          return;
        }

        setOriginalDescription(Description);
      } catch (error) {
        console.error('Error updating description:', error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [Description, project_id, canEdit, auth, originalDescription, editor]);

  const onChangeBlock = async () => {
    if (!canEdit) return;
    const HTML = await editor.blocksToHTMLLossy(editor.document);
    setDescription(HTML);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <BlockNoteView
      editor={editor}
      editable={canEdit}
      aria-disabled={!canEdit}
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
