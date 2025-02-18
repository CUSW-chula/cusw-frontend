import { TagProps, type TaskProps } from '@/app/types/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { type ChangeEvent, FormEvent, useState } from 'react';
import BASE_URL, { User } from '@/lib/shared';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { getCookie } from 'cookies-next';
import { BlockNoteView } from '@blocknote/shadcn';
import { useCreateBlockNote } from '@blocknote/react';

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
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const editor = useCreateBlockNote();
  const handleSubmit = async () => {
    const url = `${BASE_URL}/v2/tasks/`;
    const HTML = await editor.blocksToHTMLLossy(editor.document);
    const options = {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: inputs.taskTitle,
        description: HTML,
        budget: 0,
        advance: 0,
        parentTaskId: task.id,
        expense: 0,
        status: 'Unassigned',
        projectId: task.projectId,
        startDate: new Date(),
        endDate: new Date(),
      }),
    };
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      router.push(`/tasks/${data.id}`);
      toast({
        title: 'Task Created Successfully',
        description: 'Your task has been created and saved successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Task Creation Failed',
        description: 'There was an issue creating your task. Please try again.',
        variant: 'destructive',
      });
    }
  };
  return (
    <div className="min-h-60 w-full p-6 bg-gray-50 rounded-md shadow border border-[#6b5c56] flex-col justify-start items-start gap-4 inline-flex">
      <div className="min-h-30 w-full flex flex-col gap-2">
        <Input
          className="resize-none border-none w-full outline-none placeholder-black font-semibold text-3xl font-Anuphan leading-[48px]"
          placeholder="Task title"
          name="taskTitle"
          value={inputs.taskTitle || ''}
          onChange={handleChange}
        />
        <BlockNoteView editor={editor} theme={'light'} emojiPicker={false} />
        {/* <Textarea
          className="resize-none border-none bg-transparent w-full outline-none text-black text-xl font-Anuphan leading-7"
          placeholder="Task description"
          name="taskDescription"
          value={inputs.taskDescription || ''}
          onChange={handleChange}
        /> */}
      </div>
      <div className="self-stretch min-h-[92px] flex-col justify-start items-start gap-3 flex">
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
            onClick={handleSubmit}>
            Create
          </Button>
        </div>
      </div>
    </div>
  );
};
