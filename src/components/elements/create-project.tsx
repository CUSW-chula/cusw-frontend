'use client';
import { getCookie } from 'cookies-next';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import BASE_URL, { type ProjectOverviewProps } from '@/lib/shared';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@radix-ui/react-tooltip';
import { CrownIcon, Users, Tag, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAtom, useAtomValue } from 'jotai';
import { moneyAtom } from '@/atom'; // Adjust the import path as necessary
import { ButtonAddTags } from './button-add-projecttag';
import { Money } from './money';

const cookie = getCookie('auth');
const auth = cookie?.toString() ?? '';

interface UsersProps {
  id: string;
  name: string;
  email: string;
}

const CancelButton = ({
  project_id,
  auth,
}: {
  project_id: string;
  auth: string;
}) => {
  const router = useRouter();

  const handleCancelClick = () => {
    handleDeleteProject(project_id, auth);
    router.push('/projects');
  };

  return (
    <div className="bg-white rounded-md border border-[#6b5c56] cursor-pointer">
      <Button
        onClick={handleCancelClick}
        className="text-black text-sm font-medium leading-normal bg-white hover:bg-white">
        Cancel
      </Button>
    </div>
  );
};

const handleDeleteProject = async (project_id: string, auth: string) => {
  const url = `${BASE_URL}/v2/projects/${project_id}`;
  const options = {
    method: 'DELETE',
    headers: { Authorization: auth },
  };

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error('Failed to delete project');
    }
    console.info('Deleted project:', project_id);
  } catch (error) {
    console.error('Error deleting project:', error);
  }
};

const MenuBar = ({ project_id }: ProjectOverviewProps) => {
  const [ProjectOwner, setProjectOwner] = useState<UsersProps[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`${BASE_URL}/v2/projects/${project_id}`, {
          headers: {
            Authorization: auth,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch project data');
        }
        const data = await res.json();
        setProjectOwner(data.owner);
        setStartDate(new Date(data.startDate));
        setEndDate(new Date(data.endDate));
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };
    fetchProject();
  }, [project_id, auth]);

  const getInitials = (name: string) => {
    if (typeof name !== 'string') return ''; // Handle non-string input
    const nameParts = name.split(' ');
    return nameParts.map((part) => part[0]).join(''); // Take the first letter of each part
  };

  const getFirstName = (name: string) => {
    if (typeof name !== 'string') return ''; // Handle non-string input
    const nameParts = name.split(' ');
    return nameParts[0];
  };

  return (
    <div className="min-h-[350px] w-[395px] p-5 bg-white rounded-md border border-[#6b5c56] flex-col justify-start items-start gap-4 inline-flex">
      <div aria-label="owner" className="h-10 justify-start items-center inline-flex">
        <div className="w-24 justify-start items-center gap-2 flex">
          <CrownIcon className="w-[24px] h-[24px] text-black" />

          <div className="text-[#6b5c56] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
            Owner :{' '}
          </div>
        </div>
        {/* get Owner name from API */}
        <TooltipProvider>
          <div className="flex items-center space-x-2">
            {ProjectOwner.map((owner) => (
              <Tooltip key={owner.id}>
                <TooltipTrigger>
                  <div className="w-[24px] h-[24px] bg-gray-100 rounded-full border flex items-center justify-center border-brown text-brown text-sm font-BaiJamjuree">
                    {getInitials(owner.name)}
                  </div>
                </TooltipTrigger>
                <span className="text-black text-sm font-BaiJamjuree">{owner.name}</span>
                <TooltipContent>{owner.name}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
      <div aria-label="tag" className="justify-start items-center inline-flex flex-wrap w-full">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex self-start ">
          {/* Icon */}
          <Tag className="w-6 h-6 relative" />
          {/* Description */}
          <div className="text-[#6b5c56] text-xs font-medium font-BaiJamjuree leading-tight">
            Tag :{' '}
          </div>
        </div>
        <div className="flex w-[253.67px] ">
          <ButtonAddTags project_id={project_id} />
        </div>
      </div>
    </div>
  );
};

type Template = {
  id: string;
  filePath: string;
  fileSize: number;
  fileName: string;
  uploadedBy: string;
  createdAt: Date;
};

export const CreateProject = ({ project_id }: ProjectOverviewProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const router = useRouter();
  const money = useAtomValue(moneyAtom);
  const id = project_id;

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const project_id = searchParams.get('project_id'); // Retrieve project_id from query params

    if (project_id) {
      // You can now use project_id safely here
      console.log(project_id);
    }
  }, []); // Empty dependency array to run only once

  const handleNavigateToTemplatePage = async () => {
    const url = `/projects/${project_id}`;
    if (selectedTemplate) {
      await createTasks(selectedTemplate);
      router.push(url);
    }
  };

  const handleAddTask = async (project_id: string, auth: string) => {
    if (taskTitle === '') {
      alert('Title is required');
      return;
    }
    const url = `${BASE_URL}/v2/tasks/`;
    const options = {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: taskTitle,
        description: description,
        budget: money[0],
        advance: money[1],
        expense: money[2],
        status: 'Unassigned',
        parentTaskId: '',
        projectId: project_id,
        startDate: new Date(),
        endDate: new Date(),
      }),
    };

    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error('Failed to add task');
      }
      router.push(`/projects/${project_id}`);
    } catch (error) {
      console.error('Error adding task:', error);
    }
    console.info('Adding task to project:', project_id);
  };

  const updateProject = async () => {
    console.log('patch project');
    const url = `${BASE_URL}/v2/projects/${project_id}`;
    const options = {
      method: 'PATCH',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: projectTitle,
        description: projectDescription,
      }),
    };

    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error('Failed to add project title');
      }
    } catch (error) {
      console.error('Error update project:', error);
    }
  };

  const [allTemplates, setAllTemplates] = useState<Template[]>();

  const createTasks = async (template: Template) => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(template.filePath);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error get templates:', error);
      }
    };
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const fetchPostTemplate = async (templateFormat: any) => {
      console.log(templateFormat);
      try {
        const response = await fetch(`${BASE_URL}/v2/tasks/template/${project_id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: auth,
          },
          body: JSON.stringify(templateFormat),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log(`Post successful ${response.status}`);
      } catch (error) {
        console.error('Error create tasks with template:', error);
      }
    };
    const templateFormat = await fetchTemplate();
    await fetchPostTemplate(templateFormat);
  };

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const parseJsonValuesTemplate = useCallback((values: any[]): Template[] => {
    return values.map((value) => ({
      id: value.id, // Corrected key reference
      filePath: value.filePath,
      fileSize: value.fileSize,
      fileName: value.fileName,
      uploadedBy: value.uploadedBy,
      createdAt: new Date(value.createdAt), // Correctly parse the date
    }));
  }, []);

  useEffect(() => {
    const fetchTemplate = async () => {
      const url = `${BASE_URL}/v2/template`;
      const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
      };
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        setAllTemplates(parseJsonValuesTemplate(data));
      } catch (error) {
        console.error('Error get templates:', error);
      }
    };
    fetchTemplate();
  }, [parseJsonValuesTemplate]);

  const SelectTemplate = () => {
    return (
      <div className="flex flex-col justify-between items-start space-y-6">
        <div className="grid grid-cols-3 gap-4 p-4 w-full overflow-auto">
          {allTemplates?.map((template) => (
            <div
              key={template.id}
              className={`p-4 border rounded-md hover:shadow-md ${template.id === selectedTemplate?.id ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setSelectedTemplate(template)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSelectedTemplate(template);
                }
              }}>
              <div className="flex items-center gap-3">
                {/* <span className="text-2xl">{template.icon}</span> */}
                <span className="text-sm font-medium">
                  {template.fileName.replace('.json', '')}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="self-stretch flex-col justify-center items-end flex">
          <div className="justify-start items-start gap-3 inline-flex">
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="px-4 py-2 bg-white border-[#6b5c56] justify-center items-center gap-2.5 flex">
                Cancel
              </Button>
            </DialogTrigger>
            <Button
              variant="destructive"
              className="px-4 py-2 bg-brown justify-center items-center gap-2.5 flex"
              onClick={handleNavigateToTemplatePage} // Handle navigation after selecting a template
            >
              Select Template
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[414px] px-20 flex-col justify-start items-start gap-[18px] inline-flex w-full">
      <div className="self-stretch text-black text-5xl font-semibold font-Anuphan leading-[48px]">
        Create Project
      </div>
      <div className="self-stretch justify-center items-start gap-7 inline-flex">
        <div className="grow shrink basis-0 h-[348px] p-5 bg-white rounded-md border border-[#6b5c56] flex-col justify-between items-start inline-flex">
          <form className="self-stretch h-[82px] flex-col justify-start items-start gap-[18px] flex">
            <Input
              className="resize-none border-none w-full outline-none placeholder-black font-semibold text-3xl font-Anuphan leading-[48px]"
              placeholder="Project title"
              onChange={(e) => setProjectTitle(e.target.value)}
            />
            <Textarea
              className="resize-none border-none w-full outline-none text-black text-xl font-Anuphan leading-7"
              placeholder="Project description"
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </form>
          <div className="self-stretch h-[104px] flex-col justify-center items-end gap-3 flex">
            <div className="self-stretch h-[52px] flex-col justify-center items-start gap-3 flex">
              <div className="justify-start items-start gap-3 inline-flex">
                <CancelButton project_id={project_id} auth={auth} />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={projectTitle === ''}
                      onClick={() => updateProject()}
                      className="px-4 py-2 bg-brown justify-center items-center gap-2.5 flex">
                      Select Project Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[920px] max-h-[400px] h-full w-full p-6 bg-white rounded-md shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] border border-[#6b5c56] flex-col justify-between items-center inline-flex">
                    <DialogTitle className="hidden" />
                    <Tabs className="w-full max-w-[654px]">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="New Task">New Task</TabsTrigger>
                        <TabsTrigger value="Select Template">Select Template</TabsTrigger>
                      </TabsList>
                      <TabsContent value="New Task">
                        <div className="flex flex-col justify-between items-start space-y-6 max-h-[400px]">
                          <div className="w-full space-y-4">
                            <Input
                              className="resize-none border-none w-full outline-none placeholder-black font-semibold text-3xl font-Anuphan leading-[48px]"
                              placeholder="add task title"
                              onChange={(e) => setTaskTitle(e.target.value)}
                            />
                            <Textarea
                              className="resize-none border-none w-full outline-none text-black text-xl font-Anuphan leading-7"
                              placeholder="add description"
                              onChange={(e) => setDescription(e.target.value)}
                            />
                          </div>
                          <div className="self-stretch h-[104px] flex-col justify-center items-end gap-3 flex">
                            <div className="self-stretch h-[52px] flex-col justify-center items-start gap-3 flex">
                              <div className="justify-start items-center gap-3 inline-flex">
                                {/* <AssignedTaskToMember task_id={''} /> */}
                                <Money task={null} />
                              </div>
                            </div>
                            <div className="justify-start items-start gap-3 inline-flex">
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="px-4 py-2 bg-white border-[#6b5c56] justify-center items-center gap-2.5 flex">
                                  Cancel
                                </Button>
                              </DialogTrigger>
                              <Button
                                variant="destructive"
                                className="px-4 py-2 bg-brown justify-center items-center gap-2.5 flex"
                                onClick={() => handleAddTask(id, auth)}>
                                Add Task
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="Select Template">
                        <SelectTemplate />
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
        <MenuBar project_id={project_id} />
      </div>
    </div>
  );
};
