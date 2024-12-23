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
import { DatePickerWithRange } from './date-feature';
import BASE_URL from '@/lib/shared';
import type { ProjectOverviewProps } from '@/lib/shared';
import { Redo2 } from 'lucide-react';

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

const BackButton = () => {
  return (
    <Button
      variant="link"
      size="sm"
      className="font-BaiJamjuree bg-white border-2 border-brown text-brown text-sm">
      <Redo2 className="transform rotate-180 text-brown" /> Back
    </Button>
  );
};

const SunMoney = ({ projectid }: { projectid: string }) => {
  const [budget, setBudget] = useState<number>(0);
  const [advance, setAdvance] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`${BASE_URL}/projects/money/${projectid}`, {
          headers: {
            Authorization: auth,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch project data');
        }
        const data = await res.json();
        console.log(data);

        setBudget(data.budget);
        setAdvance(data.advance);
        setExpense(data.expense);
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };
    fetchProject();
  }, [projectid, auth]);

  console.log(budget, advance, expense);

  const total = budget - expense;

  return (
    <div className="h-5 flex items-center justify-start">
      <div className="px-3 py-2 rounded-md border border-[#6b5c56] flex items-center gap-2">
        <div className="flex items-center">
          <span className="text-black text-2xl font-semibold font-BaiJamjuree">฿</span>
        </div>
        <div className="flex items-center">
          <span className="text-black text-base font-medium font-BaiJamjuree">
            {budget.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center">
          <span
            className={`text-2xl font-semibold font-BaiJamjuree ${
              total < 0 ? 'text-red' : 'text-green'
            }`}>
            ฿
          </span>
        </div>
        <div className="flex items-center">
          <span
            className={`text-base font-medium font-BaiJamjuree ${
              total < 0 ? 'text-red' : 'text-green'
            }`}>
            {Math.abs(total).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};


export const ProjectDetail = ({ project_id }: ProjectOverviewProps) => {
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
    };
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
    <div className="max-h-[414px] px-20 flex-col justify-start items-start gap-[18px] inline-flex max-w-1260px w-full ">
      <div className="max-w-[1260px] h-12 px-0.5 justify-between items-center inline-flex w-full">
        <div className="text-black text-5xl font-semibold font-Anuphan leading-[48px]">
          Project
        </div>
          <div className="justify-start items-center gap-2 inline-flex">
            <div className="w-6 h-6 relative origin-top-left -rotate-180 overflow-hidden" />
            <div className="text-[#6b5c56] text-base font-normal font-BaiJamjuree leading-normal">
              <BackButton/>
            </div>
        </div>
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
            <div className="resize-none border-none w-full outline-none placeholder-black font-semibold text-3xl font-Anuphan leading-[48px]">
              {projectName}
            </div>
            <div className="resize-none border-none w-full outline-none text-black text-xl font-Anuphan leading-7">
              {projectDescription}
            </div>
          </div>
          <div className="self-stretch h-[104px] flex-col justify-center items-end gap-3 flex">
            <div className="self-stretch h-[52px] flex-col justify-center items-start gap-3 flex">
              <div className="justify-start items-center gap-3 inline-flex">
                <SunMoney projectid={project_id} />
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
