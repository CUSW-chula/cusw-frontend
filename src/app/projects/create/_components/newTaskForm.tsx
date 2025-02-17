import type { FormInput } from '@/app/types/createProjectType';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ChangeEvent, FormEvent } from 'react';

interface NewSingleTaskProps {
  inputs: FormInput;
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const NewSingleTask: React.FC<NewSingleTaskProps> = ({
  inputs,
  handleChange,
  handleSubmit,
}) => {
  return (
    <form
      className="flex flex-col justify-between items-start space-y-6 max-h-[400px]"
      onSubmit={handleSubmit}>
      <div className="w-full space-y-4">
        <Input
          className="resize-none border-none w-full outline-none placeholder-black font-semibold text-3xl font-Anuphan leading-[48px]"
          placeholder="add task title"
          type="text"
          name="taskTitle"
          value={inputs.taskTitle || ''}
          onChange={handleChange}
        />
        <Textarea
          className="resize-none border-none w-full outline-none text-black text-xl font-Anuphan leading-7"
          placeholder="add description"
          name="taskDescription"
          value={inputs.taskDescription || ''}
          onChange={handleChange}
        />
      </div>
      <div className="self-stretch h-[104px] flex-col justify-center items-end gap-3 flex">
        <div className="justify-start items-start gap-3 inline-flex">
          <Button
            variant="outline"
            className="px-4 py-2 bg-white border-[#6b5c56] justify-center items-center gap-2.5 flex">
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-4 py-2 bg-brown justify-center items-center gap-2.5 flex">
            Add Task
          </Button>
        </div>
      </div>
    </form>
  );
};
