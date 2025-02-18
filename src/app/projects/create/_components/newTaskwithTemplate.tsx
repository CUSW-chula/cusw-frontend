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
    <form className="flex flex-col justify-between items-start space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-3 gap-4 p-4 w-full overflow-auto">
        {allTemplates?.map((template) => (
          <Button
            key={template.id}
            type="button"
            variant={'secondary'}
            className={`${template.id === inputs.task?.template.id ? 'bg-gray-500' : ''}`}
            onClick={() => handleTemplateSelect(template)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTemplateSelect(template);
              }
            }}>
            <div className="flex items-center gap-3">
              {/* <span className="text-2xl">{template.icon}</span> */}
              <span className="text-sm font-medium">{template.fileName}</span>
            </div>
          </Button>
        ))}
      </div>
      <div className="self-stretch justify-end items-start gap-3 inline-flex">
        <Button
          variant="outline"
          className="px-4 py-2 bg-white border-[#6b5c56] justify-center items-center gap-2.5 flex">
          Cancel
        </Button>
        <Button
          variant="destructive"
          type="submit"
          className="px-4 py-2 bg-brown justify-center items-center gap-2.5 flex">
          Select Template
        </Button>
      </div>
    </form>
  );
};
