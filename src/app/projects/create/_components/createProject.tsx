'use client';
import { getCookie } from 'cookies-next';
import type React from 'react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BASE_URL from '@/lib/shared';
import { useRouter } from 'next/navigation';
import { NewSingleTask, NewTaskwithTemplate } from '@/app/projects/create/_components';
import { useCreateProject } from '@/hooks/useProject';
import { getAllTemplates } from '@/service/templateService';
import type { FormInput, Template } from '@/app/types/createProjectType';
import { type Budget, TypeMoney } from '@/app/types/moneyType';

const cookie = getCookie('auth');
const auth = cookie?.toString() ?? '';

export const CreateProject = () => {
  const router = useRouter();
  const [allTemplates, setAllTemplates] = useState<Template[]>();
  const [inputs, setInputs] = useState<FormInput>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const templates = await getAllTemplates(auth, BASE_URL);
        setAllTemplates(templates);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      }
    };

    fetchData();
  }, []);
  const { handleProjectCreation } = useCreateProject(inputs, auth, BASE_URL);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleProjectCreation();
  };

  const handleTemplateSelect = (template: Template) => {
    setInputs((values) => ({
      ...values,
      task: { template: template },
      taskTitle: undefined,
      taskDescription: undefined,
    }));
  };

  // const handleChangeTag = (tag: TagProps[]) => {
  //   const name = 'projectTag';
  //   setInputs((values) => ({ ...values, [name]: tag }));
  // };

  return (
    <div className="h-full px-20 flex flex-col justify-start items-start gap-4 w-full">
      <h1 className="text-black text-5xl font-semibold font-Anuphan">Create Project</h1>
      {/* <div className="inline-flex w-full gap-7"> */}
      <form className="w-full h-[348px] p-5 bg-white rounded-md border border-[#6b5c56] flex-col justify-between items-start inline-flex">
        <div className="self-stretch h-[82px] flex-col justify-start items-start gap-[18px] flex">
          <Input
            className="resize-y border-none w-full h-60 outline-none placeholder-black font-semibold text-3xl font-Anuphan leading-[48px]"
            placeholder="Project title"
            name="projectTitle"
            value={inputs.projectTitle || ''}
            onChange={handleChange}
          />
          <Textarea
            className="resize-none border-none w-full outline-none text-black text-xl font-Anuphan leading-7"
            placeholder="Project description"
            name="projectDescription"
            value={inputs.projectDescription || ''}
            onChange={handleChange}
          />
        </div>
        <div className="justify-start items-start gap-3 inline-flex">
          <Button
            variant="outline"
            className="px-4 py-2 bg-white border-[#6b5c56] justify-center items-center gap-2.5 flex"
            onClick={() => router.push('/projects')}>
            Cancel
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={inputs.projectTitle === undefined}
                className="px-4 py-2 bg-brown justify-center items-center gap-2.5 flex">
                Select Project Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[920px] max-h-[400px] h-full w-full p-6 bg-white rounded-md shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] border border-[#6b5c56] flex-col justify-between items-center inline-flex">
              <DialogTitle className="hidden" />
              <Tabs className="w-full px-4">
                <TabsList className="flex max-w-[400px] w-full justify-evenly mx-auto">
                  <TabsTrigger className="w-full" value="New Task">
                    New Task
                  </TabsTrigger>
                  <TabsTrigger className="w-full" value="Select Template">
                    Select Template
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="New Task">
                  <NewSingleTask
                    inputs={inputs}
                    handleChange={handleChange}
                    handleChangeBudgets={handleChangeBudgets}
                    handleSubmit={handleSubmit}
                  />
                </TabsContent>
                <TabsContent value="Select Template">
                  <NewTaskwithTemplate
                    inputs={inputs}
                    allTemplates={allTemplates}
                    handleSubmit={handleSubmit}
                    handleTemplateSelect={handleTemplateSelect}
                  />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </form>
      {/* <MenuBar inputs={inputs} handleChangeTag={handleChangeTag} owner={owner} /> */}
      {/* </div> */}
    </div>
  );
};
