'use client';
import { getCookie } from 'cookies-next';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import BASE_URL from '@/lib/shared';
import type { ProjectOverviewProps } from '@/lib/shared';
import { Calendar, CrownIcon, Redo2, User, Users } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

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
interface UsersProps {
  id: string;
  name: string;
  email: string;
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

const formatDate = (startdate: Date | null, enddate: Date | null): string => {
  // Return an empty string if both dates are not provided
  if (!startdate || !enddate) return '';

  const format = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format startdate and enddate if they are valid
  const start = startdate ? format(startdate) : '';
  const end = enddate ? format(enddate) : '';

  return `${start}${start && end ? ' -> ' : ''}${end}`;
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

        setBudget(data.budget);
        setAdvance(data.advance);
        setExpense(data.expense);
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };
    fetchProject();
  }, [projectid, auth]);

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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [ProjectOwner, setProjectOwner] = useState<UsersProps[]>([]);
  const [member, setMember] = useState<UsersProps[]>([]);
  const MAX_VISIBLE_MEMBERS = 3;
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const parseJsonValue = useCallback((value: any[]) => {
    return value.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
    }));
  }, []);

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
        setStartDate(new Date(data.startDate));
        setEndDate(new Date(data.endDate));
      } catch (error) {
        console.error(error);
      }
    };
    fetchProject();
  }, [project_id, auth]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`${BASE_URL}/users/projectowner/${project_id}`, {
          headers: {
            Authorization: auth,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch project data');
        }
        const data = await res.json();
        setProjectOwner(parseJsonValue(data));
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };
    fetchProject();
  }, [project_id, auth, parseJsonValue]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`${BASE_URL}/users/projectmember/${project_id}`, {
          headers: {
            Authorization: auth,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch project data');
        }
        const data = await res.json();
        setMember(parseJsonValue(data));
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };
    fetchProject();
  }, [project_id, auth, parseJsonValue]);

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
        <div className="text-black text-5xl font-semibold font-Anuphan leading-[48px]">Project</div>
        <div className="justify-start items-center gap-2 inline-flex">
          <div className="w-6 h-6 relative origin-top-left -rotate-180 overflow-hidden" />
          <div className="text-[#6b5c56] text-base font-normal font-BaiJamjuree leading-normal">
            <BackButton />
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
          <div className="self-stretch h-[120px] flex-col justify-center items-end gap-3 flex">
            <div className="self-stretch h-[52px] flex-col justify-center items-start gap-3 flex">
              <div className="justify-start items-center gap-3 inline-flex">
                <CrownIcon className="w-[24px] h-[24px] text-black" />
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

                <Users className="w-[24px] h-[24px] text-black" />
                <TooltipProvider>
                  <div className="flex items-center space-x-2">
                    {member.slice(0, MAX_VISIBLE_MEMBERS).map((user) => (
                      <Tooltip key={user.id}>
                        <TooltipTrigger>
                          <div className="w-[24px] h-[24px] bg-gray-100 rounded-full border border-[#6b5c56] flex-col justify-center items-center gap-2.5 inline-flex text-center text-[#6b5c56] text-sm font-BaiJamjuree ">
                            {getInitials(user.name)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{user.name}</TooltipContent>
                      </Tooltip>
                    ))}
                    {member.length > MAX_VISIBLE_MEMBERS && (
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="w-[24px] h-[24px] bg-gray-100 rounded-xl border border-[#6b5c56] flex-col justify-center items-center gap-2.5 inline-flex text-center text-[#6b5c56] text-xs font-medium font-BaiJamjuree leading-3">
                            +{member.length - MAX_VISIBLE_MEMBERS}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {member.slice(MAX_VISIBLE_MEMBERS).map((user) => (
                            <p key={user.id}>{user.name}</p>
                          ))}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TooltipProvider>

                <SunMoney projectid={project_id} />
                <Calendar className="w-[24px] h-[24px] relative text-black" />
                {formatDate(startDate, endDate)}
              </div>
            </div>
            <hr className="my-4 w-full border-t-1 border-gray-200" />
            <div className="justify-start items-start gap-1 inline-flex">
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
