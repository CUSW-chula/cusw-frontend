'use client';
import { getCookie } from 'cookies-next';
import type React from 'react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Money } from './money';
import { DatePickerWithRange } from './date-feature';
import { ProjectOwner } from './project-owner';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AssignedTaskToMember } from './assigned-task';

interface ProjectProps {
  id: string;
  title: string;
  description: string;
  budget: number;
  advance: number;
  expense: number;
  startDate: Date;
  endDate: Date;
  tasks: taskProps[];
  files: File[];
}

interface taskProps {
  id: string;
  title: string;
  description: string;
  budget: number;
  advance: number;
  expense: number;
  status: 'Unassigned' | 'Assigned' | 'UnderReview' | 'InRecheck' | 'Done';
  parentTaskId: string;
  projectId: string;
  createdById: string;
  startDate: Date;
  endDate: Date;
  tags?: string[];
  subtasks?: taskProps[];
}

const CancelButton = () => {
  return (
    <div className="px-4 py-2 bg-white rounded-md border border-[#6b5c56] justify-center items-center gap-2.5 flex">
      <div className="text-black text-sm font-medium font-['Inter'] leading-normal">Cancel</div>
    </div>
  );
};

export const CreateProject = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const token = getCookie('token');

  const handleSelectTemplate = () => {
    return (
      <Dialog>
        <DialogTrigger>
          <Button
            variant="destructive"
            className="px-4 py-2 bg-brown justify-center items-center gap-2.5 flex">
            Select Project Template
          </Button>
        </DialogTrigger>
      </Dialog>
    );
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setPhoto(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClickPhoto = () => {
    document.getElementById('photoInput')?.click(); // Trigger hidden file input
  };

  return (
    <div className="h-[414px] px-20 flex-col justify-start items-start gap-[18px] inline-flex w-full">
      <div className="self-stretch text-black text-5xl font-semibold font-Anuphan leading-[48px]">
        Project
      </div>
      <div className="self-stretch justify-center items-start gap-7 inline-flex">
        <div className="p-5 bg-white rounded-md border border-[#6b5c56] flex-col justify-center items-center inline-flex">
          <div
            className="w-[158px] h-[244px] bg-[#7d7d7d] rounded-[5px] flex-col justify-center items-center flex cursor-pointer"
            onClick={handleClickPhoto}
            onKeyUp={(e) => {
              if (e.key === 'Enter') handleClickPhoto();
            }}>
            {photo ? (
              <img
                src={photo}
                alt="Project Thumbnail"
                className="w-full h-full object-cover rounded-[5px]"
              />
            ) : (
              <Button
                variant="outline"
                className="px-4 py-2 bg-white border-[#6b5c56] justify-center items-center gap-2.5 flex">
                Add Photo
              </Button>
            )}
            <input
              type="file"
              id="photoInput"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </div>
        </div>
        <div className="grow shrink basis-0 h-[348px] p-5 bg-white rounded-md border border-[#6b5c56] flex-col justify-between items-start inline-flex">
          <div className="self-stretch h-[82px] flex-col justify-start items-start gap-[18px] flex">
            <Input
              className="resize-none border-none w-full outline-none placeholder-black font-semibold text-3xl font-Anuphan leading-[48px]"
              placeholder="Project title"
            />
            <Textarea
              className="resize-none border-none w-full outline-none text-black text-xl font-Anuphan leading-7"
              placeholder="Project description"
            />
          </div>
          <div className="self-stretch h-[104px] flex-col justify-center items-end gap-3 flex">
            <div className="self-stretch h-[52px] flex-col justify-center items-start gap-3 flex">
              <div className="justify-start items-center gap-3 inline-flex">
                <ProjectOwner />
                <Money />
              </div>
            </div>
            <div className="justify-start items-start gap-3 inline-flex">
              <Button
                variant="outline"
                className="px-4 py-2 bg-white border-[#6b5c56] justify-center items-center gap-2.5 flex">
                Cancel
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="px-4 py-2 bg-brown justify-center items-center gap-2.5 flex">
                    Select Project Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[920px] max-h-[400px] h-full w-full p-6 bg-white rounded-md shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] border border-[#6b5c56] flex-col justify-between items-center inline-flex">
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
                          />
                          <Textarea
                            className="resize-none border-none w-full outline-none text-black text-xl font-Anuphan leading-7"
                            placeholder="add description"
                          />
                        </div>
                        <div className="self-stretch h-[104px] flex-col justify-center items-end gap-3 flex">
                          <div className="self-stretch h-[52px] flex-col justify-center items-start gap-3 flex">
                            <div className="justify-start items-center gap-3 inline-flex">
                              <AssignedTaskToMember task_id={''} />
                              <Money />
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
                              className="px-4 py-2 bg-brown justify-center items-center gap-2.5 flex">
                              Add Task
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="Select Template">
                      <div className="flex flex-col justify-between items-start space-y-6">
                        <div className="grid grid-cols-3 gap-4 p-4 w-full overflow-auto">
                          {[
                            { name: 'Hotline', icon: '📞' },
                            { name: 'Workshop', icon: '📋' },
                            { name: 'จ้างเหมา', icon: '🛠️' },
                            { name: 'Sup Hotline', icon: '📱' },
                            { name: 'จ้างงานในเวลา', icon: '⏱️' },
                            { name: 'Mind Talk', icon: '🧠' },
                            { name: 'จ้างงานนอกเวลา', icon: '🌙' },
                          ].map((template) => (
                            <div
                              key={template.name}
                              className="p-4 bg-white border rounded-md hover:shadow-md">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{template.icon}</span>
                                <span className="text-sm font-medium text-gray-700">
                                  {template.name}
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
                              className="px-4 py-2 bg-brown justify-center items-center gap-2.5 flex">
                              Select Template
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
