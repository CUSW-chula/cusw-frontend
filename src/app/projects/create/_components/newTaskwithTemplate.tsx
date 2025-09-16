import { Button } from '@/components/ui/button';
import { Task } from './taskpreview';
import { useEffect, type FormEvent } from 'react';
import type { FormInput, Template } from '@/app/types/createProjectType';
import { useAtom } from 'jotai';
import type { TaskProps } from '@/app/types/types';
import { taskAtom } from '@/atom';

interface NewTaskwithTemplateProps {
  inputs: FormInput;
  allTemplates: Template[] | undefined;
  handleSubmit: (event: FormEvent<HTMLFormElement>, typeofSubmit: string) => void;
  handleTemplateSelect: (template: Template) => void;
}

export const NewTaskwithTemplate: React.FC<NewTaskwithTemplateProps> = ({
  inputs,
  allTemplates,
  handleSubmit,
  handleTemplateSelect,
}) => {
  const [task, setTask] = useAtom<TaskProps[]>(taskAtom);

  useEffect(() => {
    console.info('TASK', task);
  }, [task]);

  return (
    <form
      className="flex flex-col h-full justify-between"
      onSubmit={(event) => handleSubmit(event, 'newTaskwithTemplate')}>
      <h2 className="text-xl font-BaiJamjuree text-center my-4 ">Select a Template</h2>
      <div className="flex w-full flex-1 min-h-0 p-6">
        {/* Templates Column */}
        <div className="w-1/3 flex flex-col border-r pr-4 overflow-hidden">
          <h3 className="text-lg font-BaiJamjuree font-semibold mb-4">Templates</h3>
          <div className="flex flex-wrap gap-3 overflow-y-auto pb-2">
            {allTemplates
              ?.sort((a, b) => {
                // Put Default template at the top
                const aIsDefault = a.fileName.replace('.json', '') === 'Default';
                const bIsDefault = b.fileName.replace('.json', '') === 'Default';

                if (aIsDefault && !bIsDefault) return -1;
                if (!aIsDefault && bIsDefault) return 1;
                return 0;
              })
              .map((template) => (
                <Button
                  key={template.id}
                  type="button"
                  variant={'secondary'}
                  className={`${template.id === inputs.task?.template.id ? 'bg-neutral-200' : ''} hover:bg-neutral-200 mb-2 w-full text-left`}
                  onClick={() => handleTemplateSelect(template)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTemplateSelect(template);
                    }
                  }}>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium font-BaiJamjuree">
                      {template.fileName.replace('.json', '')}
                    </span>
                  </div>
                </Button>
              ))}
          </div>
        </div>

        {/* Preview Column */}
        <div className="w-2/3 flex flex-col pl-4 overflow-hidden">
          <h3
            style={{ paddingLeft: '2rem' }}
            className="text-lg font-BaiJamjuree font-semibold mb-4">
            Preview
          </h3>
          <div className="flex flex-col gap-3 overflow-y-auto pb-2 px-2">
            {task && task.length > 0 ? (
              task.map((item) => <Task key={item.id} item={item} depth={0} hiddenDate={false} />)
            ) : (
              <p className="text-gray-500 italic">No tasks selected</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-4 bg-white">
        <div className="flex justify-end">
          <Button
            type="submit"
            className="px-4 py-2 bg-brown justify-center items-center flex"
            disabled={!inputs.task?.template}>
            Select template
          </Button>
        </div>
      </div>
    </form>
  );
};
