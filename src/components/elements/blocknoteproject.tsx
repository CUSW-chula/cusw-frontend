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
import { useEffect, useState, useRef } from 'react';
import BASE_URL, { BASE_YSWEET, type ProjectOverviewProps } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { toast } from '@/hooks/use-toast';
import { getUserRoleOnProjectTask } from '@/service/userService';
import { can } from '@/permissions/helper';

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
  const [originalDescription, setOriginalDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const hasHydratedRef = useRef<string | null>(null);
  const [providerSynced, setProviderSynced] = useState(false);
  const [hydrationDone, setHydrationDone] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    const fetchDescription = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/projects/${project_id}`, {
          headers: { Authorization: auth },
        });
        if (!response.ok) {
          await response.text();
          return;
        }
        const data = await response.json();
        if (!mounted) return;

        setDescription(data.description ?? '');
        setOriginalDescription(data.description ?? '');
        // ย้ายการ sync เข้า editor ไปทำหลัง provider sync (ดู useEffect ด้านล่าง)
      } catch (error) {
        console.error('Error fetching description:', error);
      }
    };

    const checkPermission = async () => {
      try {
        const { projectRole, taskRole, isAdmin, isHead } = await getUserRoleOnProjectTask({
          projectId: project_id,
        });
        if (!mounted) return;

        setHasEditPermission(
          can('editProjectDescription', { projectRole, taskRole, isAdmin, isHead }),
        );
      } catch (e) {
        console.error('Error checking permission:', e);
        if (!mounted) return;
        setHasEditPermission(false);
      }
    };

    Promise.all([checkPermission(), fetchDescription()]).finally(() => {
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [project_id]);

  const { audio, image, video, file, codeBlock, ...allowedBlockSpecs } = defaultBlockSpecs;
  const schema = BlockNoteSchema.create({
    blockSpecs: { ...allowedBlockSpecs },
  });

  const userData = jwtDecode<CustomJwtPayload>(auth);

  const [userName, setUserName] = useState<string | null>(null);

  const provider = useYjsProvider();
  const doc = useYDoc();

  // โหลดชื่อจริงจาก API แล้วอัปเดต state
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/v2/users/${userData.id}`, {
          headers: { Authorization: auth },
        });
        if (!res.ok) return;
        const u = await res.json();
        const full =
          u.name ||
          u.fullName ||
          u.username ||
          [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
        if (mounted && full && full !== userName) setUserName(full);
      } catch {
        // ignore and keep initialDisplayName
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userData.id]);

  const editor = useCreateBlockNote({
    schema,
    collaboration: {
      provider,
      fragment: doc.getXmlFragment('blocknote'),
      user: { color: getRandomLightColor(), name: userName || 'Anonymous User' },
    },
  });

  // ติดตามสถานะ sync ของ provider
  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const p = provider as any;
    const onSync = (isSynced: boolean) => {
      if (isSynced) setProviderSynced(true);
    };
    // เผื่อ provider รองรับทั้ง 'sync' และ 'synced'
    p?.on?.('sync', onSync);
    p?.on?.('synced', onSync);
    if (p?.synced || p?.isSynced) setProviderSynced(true);

    return () => {
      p?.off?.('sync', onSync);
      p?.off?.('synced', onSync);
    };
  }, [provider]);

  // reset ตัวกันซ้ำเมื่อเปลี่ยนโปรเจกต์
  useEffect(() => {
    hasHydratedRef.current = null;
    setHydrationDone(false);
  }, [project_id]);

  // hydrate เนื้อหาเข้า editor หลัง provider sync แล้ว และทำครั้งเดียว
  useEffect(() => {
    if (!providerSynced) return;

    // ถ้า hydrate ไปแล้วสำหรับโปรเจกต์นี้ ให้ถือว่าเสร็จ
    if (hasHydratedRef.current === project_id) {
      setHydrationDone(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        // ถ้าไม่มี Description ก็ถือว่าเสร็จ
        if (!Description) {
          if (!cancelled) {
            hasHydratedRef.current = project_id;
            setHydrationDone(true);
          }
          return;
        }
        const blocks = await editor.tryParseHTMLToBlocks(Description);
        if (cancelled) return;
        editor.replaceBlocks(editor.document, blocks);
        hasHydratedRef.current = project_id;
        setHydrationDone(true);
      } catch (e) {
        console.error('Error hydrating editor:', e);
        if (!cancelled) setHydrationDone(true); // fail-open เพื่อไม่ให้ค้าง loading
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [providerSynced, Description, editor, project_id]);

  const onChangeBlock = async () => {
    if (!hasEditPermission) return;
    const HTML = await editor.blocksToHTMLLossy(editor.document);
    setDescription(HTML);
  };

  useEffect(() => {
    if (!Description || !hasEditPermission || originalDescription === Description) return;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/projects/${project_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: auth },
          body: JSON.stringify({ description: Description }),
        });

        if (!response.ok) {
          const errText = await response.text();
          if (response.status === 403) {
            toast({
              title: 'ไม่มีสิทธิ์แก้ไข',
              description: 'คุณไม่มีสิทธิ์แก้ไขคำอธิบายโปรเจกต์นี้',
              variant: 'destructive',
            });
          } else {
            console.error('Update failed:', errText);
            toast({
              title: 'บันทึกไม่สำเร็จ',
              description: 'กรุณาลองใหม่อีกครั้ง',
              variant: 'destructive',
            });
          }
          return;
        }

        // บันทึกสำเร็จ ค่อยอัปเดต originalDescription
        setOriginalDescription(Description);
      } catch (error) {
        console.error('Error updating description:', error);
        toast({
          title: 'บันทึกไม่สำเร็จ',
          description: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
          variant: 'destructive',
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [Description, project_id, hasEditPermission]);

  // แสดง loading จนกว่าจะโหลดข้อมูล, provider sync และ hydrate เสร็จ
  if (isLoading || !providerSynced || !hydrationDone) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <BlockNoteView
      editor={editor}
      editable={hasEditPermission}
      aria-disabled={!hasEditPermission}
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
