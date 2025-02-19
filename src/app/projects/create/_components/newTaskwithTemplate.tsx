import { Button } from '@/components/ui/button';
import type { FormEvent } from 'react';
import type { FormInput, Template } from '@/app/types/createProjectType';

interface NewTaskwithTemplateProps {
  inputs: FormInput;
  allTemplates: Template[] | undefined;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleTemplateSelect: (template: Template) => void;
}

export const NewTaskwithTemplate: React.FC<NewTaskwithTemplateProps> = ({
  inputs,
  allTemplates,
  handleSubmit,
  handleTemplateSelect,
}) => {
  return (
    <form
      className="flex flex-col h-full justify-between items-start space-y-2"
      onSubmit={handleSubmit}>
      <div className="grid grid-cols-3 gap-3 p-3 w-full overflow-auto">
        {allTemplates?.map((template) => (
          <Button
            key={template.id}
            type="button"
            variant={'secondary'}
            className={`${template.id === inputs.task?.template.id ? 'bg-neutral-200' : ''} hover:bg-neutral-200`}
            onClick={() => handleTemplateSelect(template)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTemplateSelect(template);
              }
            }}>
            <div className="flex items-center gap-3">
              {/* <span className="text-2xl">{template.icon}</span> */}
              <span className="text-sm font-medium font-BaiJamjuree">
                {template.fileName.replace('.json', '')}
              </span>
            </div>
          </Button>
        ))}
      </div>
      <div className="flex flex-col overflow-auto h-28 w-full">Client template</div>
      <div className="h-auto w-auto absolute flex gap-3 bottom-6 right-8">
        <Button
          variant="outline"
          className="px-4 py-2 bg-white border-[#6b5c56] justify-center items-center flex">
          Cancel
        </Button>
        <Button
          variant="destructive"
          type="submit"
          className="px-4 py-2 bg-brown justify-center items-center flex"
          disabled={!inputs.task?.template}>
          Select Template
        </Button>
      </div>
    </form>
  );
};
