'use client';
import { getCookie } from 'cookies-next';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Money } from './money';
import { ProjectOwner } from './project-owner';
import { Input } from '../ui/input';
import { AssignedTaskToMember } from './assigned-task';
import BASE_URL from '@/lib/shared';
import type { ProjectOverviewProps } from '@/lib/shared';

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

export const ProjectDetail = ({project_id}: ProjectOverviewProps) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`${BASE_URL}/projects/${project_id}`, {
          headers: {
            Authorization: auth,
          },
        });
        const data = await res.json();
        setProjectName(data.title);
        setProjectDescription(data.description);
      } catch (error) {
        console.error(error);
      }
    }
    fetchProject();
  }, [project_id, auth]);


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
            <div
              className="resize-none border-none w-full outline-none placeholder-black font-semibold text-3xl font-Anuphan leading-[48px]"
            >{projectName}</div>
            <div
              className="resize-none border-none w-full outline-none text-black text-xl font-Anuphan leading-7"
            >{projectDescription}</div>
          </div>
          <div className="self-stretch h-[104px] flex-col justify-center items-end gap-3 flex">
            <div className="self-stretch h-[52px] flex-col justify-center items-start gap-3 flex">
              <div className="justify-start items-center gap-3 inline-flex">
                <ProjectOwner />
                {/* <AssignedTaskToMember task_id={project_id} /> */}
                <Money />
              </div>
            </div>
            <div className="justify-start items-start gap-3 inline-flex">
              <Button
                variant="destructive"
                className="px-4 py-2 bg-brown justify-center items-center gap-2.5 flex">
                Go to tasks
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
