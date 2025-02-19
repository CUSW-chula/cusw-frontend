import type { FormInput } from '@/app/types/createProjectType';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ChangeEvent, FormEvent } from 'react';
import { MoneyContainer } from './money';
import type { Budget } from '@/app/types/moneyType';

interface NewSingleTaskProps {
  inputs: FormInput;
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleChangeBudgets: (budgetList: Budget) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const NewSingleTask: React.FC<NewSingleTaskProps> = ({
  inputs,
  handleChange,
  handleChangeBudgets,
  handleSubmit,
}) => {
  return (
    <form
      className="flex flex-col justify-between items-start space-y-2 h-full"
      onSubmit={handleSubmit}>
      <div className="w-full space-y-4 pt-2 h-full">
        <Input
          className="resize-none border-none h-1/4 w-full outline-none placeholder-black font-semibold text-3xl font-Anuphan leading-loose"
          placeholder="add task title..."
          type="text"
          name="taskTitle"
          value={inputs.taskTitle || ''}
          onChange={handleChange}
        />
        <Textarea
          className="resize-none border-none h-[120px] w-full outline-none text-black text-xl font-Anuphan leading-7"
          placeholder="add description"
          name="taskDescription"
          value={inputs.taskDescription || ''}
          onChange={handleChange}
        />
        <div className="w-1/6">
          <MoneyContainer value={inputs} onChange={handleChangeBudgets} />
        </div>
      </div>
      <div className="h-auto w-auto absolute flex gap-3 bottom-6 right-8">
        <Button
          variant="outline"
          className="px-4 py-2 bg-white border-[#6b5c56] justify-center items-center flex">
          Cancel
        </Button>
        <Button type="submit" className="px-4 py-2 bg-brown justify-center items-center flex">
          {inputs.taskTitle === '' ? 'Create project without task' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
};
