'use client';
import { getCookie } from 'cookies-next';
import React from 'react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import BASE_URL from '@/lib/shared';
import { useRouter } from 'next/navigation';
import LoadingClient from '@/components/elements/loading-screen';
import { NewTaskwithTemplate } from '@/app/projects/create/_components';
import { useCreateProject } from '@/hooks/useProject';
import { getAllTemplates } from '@/service/templateService';
import type { FormInput, Template } from '@/app/types/createProjectType';
import { type Budget, TypeMoney } from '@/app/types/moneyType';
import type { TaskProps } from '@/app/types/types';
import { taskAtom } from '@/atom';
import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';

// Dynamically import the BlockNote editor component
const BlockNoteEditor = dynamic(() => import('./BlockNoteEditor'), {
  ssr: false,
  loading: () => <div className="p-4 text-gray-500">Loading editor...</div>,
});

const cookie = getCookie('auth');
const auth = cookie?.toString() ?? '';

export const CreateProject = () => {
  const router = useRouter();
  const [allTemplates, setAllTemplates] = useState<Template[]>();
  const [inputs, setInputs] = useState<FormInput>({});
  const [task, setTask] = useAtom<TaskProps[]>(taskAtom);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const templates = await getAllTemplates(auth, BASE_URL);
        setAllTemplates(templates);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const { handleProjectCreation } = useCreateProject(inputs, BASE_URL);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleChangeBudgets = (budgetList: Budget) => {
    const taskMoney = { budget: 'taskBudget', advance: 'taskAdvance', expense: 'taskExpense' };
    const resetValues = { [taskMoney.budget]: 0, [taskMoney.advance]: 0, [taskMoney.expense]: 0 };
    const key =
      budgetList.type === TypeMoney.budget
        ? taskMoney.budget
        : budgetList.type === TypeMoney.ad
          ? taskMoney.advance
          : budgetList.type === TypeMoney.exp
            ? taskMoney.expense
            : null;

    setInputs((values) => ({
      ...values,
      ...resetValues,
      ...(key ? { [key]: budgetList.money } : {}),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>, typeofSubmit: string) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await handleProjectCreation(typeofSubmit);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setInputs((values) => ({
      ...values,
      task: { template: template },
      taskTitle: undefined,
      taskDescription: undefined,
    }));
    const RenderJson = (template: Template) => {
      const url = template.filePath;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          setTask(data);
          return data;
        })
        .catch((error) => {
          console.error('Error fetching template:', error);
        });
      return null;
    };
    RenderJson(template);
  };

  const handleCancel = () => {
    router.push('/projects');
  };

  const handleDescriptionChange = (html: string) => {
    setInputs((values) => ({ ...values, projectDescription: html }));
  };

  if (isLoading || isSubmitting) {
    return <LoadingClient />;
  }

  return (
    <div className="h-full flex flex-col justify-start items-start gap-4 w-full">
      <h1 className="text-black text-5xl font-semibold font-Anuphan">Create project</h1>
      <form className="w-full h-[348px] p-5 bg-white rounded-md border border-[#6b5c56] flex-col justify-between items-start inline-flex">
        <label
          htmlFor="require part"
          className="text-red font-semibold text-2xl absolute left-[280px] top-[30px]">
          {!inputs.projectTitle && <span>*</span>}
        </label>
        <div className="self-stretch h-[82px] flex-col justify-start items-start gap-[18px] flex">
          <Input
            className="resize-y border-none w-full h-60 outline-none placeholder-black font-semibold text-3xl font-Anuphan leading-[48px]"
            placeholder="Enter project title"
            name="projectTitle"
            value={inputs.projectTitle || ''}
            onChange={handleChange}
          />
          <div
            className="border-none w-full outline-none bg-white rounded-lg overflow-hidden"
            style={{ minHeight: '100px' }}>
            <BlockNoteEditor onChange={handleDescriptionChange} />
          </div>
        </div>
        <div className="justify-start items-start gap-3 inline-flex">
          <Button
            variant="outline"
            type="button"
            className="px-4 py-2 bg-white border-[#6b5c56] justify-center items-center gap-2.5 flex font-BaiJamjuree text-brown"
            onClick={handleCancel}>
            Cancel
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={inputs.projectTitle === undefined || inputs.projectTitle === ''}
                className="px-4 py-2 bg-brown justify-center items-center gap-2.5 flex">
                Select project template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[920px] h-[60vh] w-full p-0 bg-white rounded-md shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] border border-[#6b5c56] flex flex-col">
              <DialogTitle className="hidden" />
              <NewTaskwithTemplate
                inputs={inputs}
                allTemplates={allTemplates}
                handleSubmit={handleSubmit}
                handleTemplateSelect={handleTemplateSelect}
              />
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
