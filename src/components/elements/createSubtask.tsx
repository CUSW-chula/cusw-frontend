import { TagProps, type TaskProps } from '@/app/types/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { type ChangeEvent, FormEvent, useEffect, useState } from 'react';
import BASE_URL, { User } from '@/lib/shared';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { getCookie } from 'cookies-next';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import { GridSuggestionMenuController, useCreateBlockNote } from '@blocknote/react';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import * as Card from '@/components/ui/card';
import * as DropdownMenu from '@/components/ui/dropdown-menu';
import * as Form from '@/components/ui/form';
import * as Label from '@/components/ui/label';
import * as Popover from '@/components/ui/popover';
import * as Tabs from '@/components/ui/tabs';
import * as Toggle from '@/components/ui/toggle';
import * as Tooltip from '@/components/ui/tooltip';
interface FormInput {
  taskTitle?: string;
  taskDescription?: string;
  // taskTag?: TagProps[];
  // taskMember?: User[];
  // taskStatus?: string;
}

export const CreateSubtask = ({
  task,
  setDialog,
}: { task: TaskProps; setDialog: (value: boolean) => void }) => {
  const [inputs, setInputs] = useState<FormInput>({});
  const router = useRouter();
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  const [Description, setDescription] = useState<string>('');

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleSubmit = async () => {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!inputs.taskTitle?.trim()) {
      toast({
        title: 'ข้อมูลไม่ครบถ้วน',
        description: 'กรุณาใส่ชื่อ task',
        variant: 'destructive',
      });
      return;
    }

    // ใช้วันที่ของ parent task โดยตรง
    const subtaskStartDate = task.startDate ? new Date(task.startDate) : null;
    const subtaskEndDate = task.endDate ? new Date(task.endDate) : null;

    const url = `${BASE_URL}/v2/tasks/${task.projectId}`;
    const options = {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: inputs.taskTitle.trim(),
        description: Description,
        budget: 0,
        advance: 0,
        parentTaskId: task.id,
        statusBudgets: 'Initial',
        expense: 0,
        status: 'Unassigned',
        startDate: subtaskStartDate,
        endDate: subtaskEndDate,
      }),
    };
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (response.ok) {
        router.push(`/tasks/${data.id}`);
        toast({
          title: 'สร้าง Subtask สำเร็จ',
          description: 'Subtask ของคุณได้ถูกสร้างและบันทึกเรียบร้อยแล้ว',
          variant: 'default',
        });
      } else {
        throw new Error(data.message || 'Failed to create subtask');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'การสร้าง Subtask ล้มเหลว',
        description: 'เกิดปัญหาในการสร้าง subtask กรุณาลองอีกครั้ง',
        variant: 'destructive',
      });
    }
  };
  const { audio, image, video, file, codeBlock, ...allowedBlockSpecs } = defaultBlockSpecs;
  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...allowedBlockSpecs,
    },
  });

  const editor = useCreateBlockNote({
    schema,
  });

  const onChangeBlock = async () => {
    const HTML = await editor.blocksToHTMLLossy(editor.document);
    setDescription(HTML);
  };

  return (
    <div className="w-full p-6 bg-white rounded-md shadow border border-[#6b5c56] flex-col justify-start items-start gap-4 inline-flex">
      <div className="min-h-30 w-full flex flex-col gap-2">
        <Input
          className="resize-none border-none w-full outline-none placeholder-black font-semibold text-3xl font-Anuphan leading-[48px]"
          placeholder="Task title"
          name="taskTitle"
          value={inputs.taskTitle || ''}
          onChange={handleChange}
        />
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
            Label,
            Popover,
            Tabs,
            Toggle,
            Tooltip,
          }}>
          <GridSuggestionMenuController triggerCharacter={':'} columns={5} minQueryLength={2} />
        </BlockNoteView>{' '}
        {/* <Textarea
          className="resize-none border-none bg-transparent w-full outline-none text-black text-xl font-Anuphan leading-7"
          placeholder="Task description"
          name="taskDescription"
          value={inputs.taskDescription || ''}
          onChange={handleChange}
        /> */}
      </div>

      <div className="self-stretch flex-col justify-start items-start gap-3 flex">
        <div className="self-stretch justify-end items-center gap-3 inline-flex">
          <Button
            variant="outline"
            className="text-base font-BaiJamjuree font-medium leading-normal border-[#6b5c56]"
            onClick={() => setDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            type="submit"
            className="bg-[#6b5c56] text-base font-BaiJamjuree font-medium text-white leading-normal"
            disabled={!inputs.taskTitle}
            onClick={handleSubmit}>
            Create
          </Button>
        </div>
      </div>
    </div>
  );
};
