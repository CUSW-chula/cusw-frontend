'use client';
import { getCookie } from 'cookies-next';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import BASE_URL from '@/lib/shared';
import type { ProjectOverviewProps } from '@/lib/shared';
import { Calendar, CrownIcon, Redo2, Tag, Trash2, User, Users } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { useRouter } from 'next/navigation';
import ProjectWorkspace from './project-workspace';
import { ButtonAddTags } from './button-add-projecttag';

interface projectProps {
  id: string;
  title: string;
  description: string;
  budget: number;
  advance: number;
  expense: number;
  startDate: Date;
  endDate: Date;
  owner: UsersProps;
  members: UsersProps[];
  tags: Tags[];
}

interface Tags {
  id: string;
  name: string;
}
interface Files {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  taskId: string;
  projectId: string;
  uploadedBy: string;
  createdAt: Date;
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

interface DeleteTaskProps {
  project_id: string;
}

const DeleteProject: React.FC<DeleteTaskProps> = ({ project_id }) => {
  const router = useRouter();
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const handleDeleteTask = async () => {
    const url = `${BASE_URL}api/v2/projects/${project_id}`;
    const options = { method: 'DELETE', headers: { Authorization: auth } };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(data);
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <div className="h-9 w-45 px-2 py-1.5 bg-red-300 rounded-md border bg-white border-red justify-start items-start gap-[13px] inline-flex hover:bg-red group">
          <Trash2 className="w-6 h-6 text-red group-hover:text-white" />
          <div className="text-base font-semibold font-BaiJamjuree text-red group-hover:text-white">
            Delete Project
          </div>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteTask} className="bg-red">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const BackButton = () => {
  const router = useRouter();

  return (
    <Button
      variant="link"
      size="sm"
      className="font-BaiJamjuree bg-white border-2 border-brown text-brown text-sm"
      onClick={() => router.push('/projects')}>
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

const SumMoney = ({
  budget,
  advance,
  expense,
}: { budget: number; advance: number; expense: number }) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

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

const MenuBar = ({ project_id }: ProjectOverviewProps) => {
  const [ProjectOwner, setProjectOwner] = useState<UsersProps[]>([]);
  const [member, setMember] = useState<UsersProps[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState<number>(0);
  const [advance, setAdvance] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);
  const MAX_VISIBLE_MEMBERS = 3;
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
        console.log("Data", data);
        setProjectOwner(data.owner);
        setMember(data.members);
        setStartDate(new Date(data.startDate));
        setEndDate(new Date(data.endDate));
        setBudget(data.budget);
        setAdvance(data.advance);
        setExpense(data.expense);
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
    <div className="min-h-[350px] w-[395px] p-5 bg-white rounded-md border border-[#6b5c56] flex-col justify-between items-start gap-4 inline-flex">
      <div aria-label="owner" className="h-10 justify-start items-center inline-flex">
        <div className="w-24 justify-start items-center gap-2 flex">
          <CrownIcon className="w-[24px] h-[24px] text-black" />

          <div className="text-[#6b5c56] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
            Owner :{' '}
          </div>
        </div>
        <TooltipProvider>
          <div className="flex items-center space-x-2 rounded-md border border-brown h-10 px-4">
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
      <div aria-label="member" className="h-10 justify-start items-center inline-flex">
        <div className="w-24 justify-start items-center gap-2 flex">
          <Users className="w-[24px] h-[24px] text-black" />

          <div className="text-[#6b5c56] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
            Member :{' '}
          </div>
        </div>
        <TooltipProvider>
          <div className="flex items-center space-x-2 rounded-md border border-brown h-10 px-4">
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
      <div aria-label="money" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <div className="w-6 text-center text-black text-[30px] font-medium font-BaiJamjuree">
            ฿
          </div>

          {/* Describtion */}
          <div className="text-[#6b5c56] text-xs font-medium font-BaiJamjuree leading-tight">
            Money :{' '}
          </div>
        </div>
        <SumMoney budget={budget} advance={advance} expense={expense} />
      </div>
      <div aria-label="date" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <Calendar className="w-6 h-6 relative" />
          {/* Describtion */}
          <div className="text-[#6b5c56] text-xs font-medium font-BaiJamjuree leading-tight">
            Date :{' '}
          </div>
        </div>
        {formatDate(startDate, endDate)}
      </div>
    </div>
  );
};

export const ProjectDetail = ({ project_id }: ProjectOverviewProps) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const Router = useRouter();

  const handleClick = () => {
    const url = `/projects/${project_id}`;
    Router.push(url);
  };

  return (
    <div className="max-h-[414px] px-20 flex-col justify-start items-start gap-[18px] inline-flex w-full">
      <div className="h-12 px-0.5 justify-between items-center inline-flex w-full">
        <div className="text-black text-5xl font-semibold font-Anuphan leading-[48px]">Project</div>
        <div className="justify-start items-center gap-2 inline-flex">
          <div className="w-6 h-6 relative origin-top-left -rotate-180 overflow-hidden" />
          <div className="text-[#6b5c56] text-base font-normal font-BaiJamjuree leading-normal">
            <BackButton />
          </div>
        </div>
      </div>
      <div className="self-stretch justify-center items-start gap-7 inline-flex">
        <div className="grow shrink basis-0 min-h-[348px] h-auto p-5 bg-white rounded-md border border-[#6b5c56] flex-col justify-between items-start inline-flex">
          <div className="self-stretch h-full flex-col justify-start items-start gap-[18px] flex">
            <ProjectWorkspace project_id={project_id} />
          </div>
          <div className="self-stretch h-[120px] flex-col justify-center items-end gap-3 flex">
            <hr className="my-4 w-full border-t-1 border-gray-200" />
            <div className="justify-start items-start gap-1 inline-flex">
              <Button
                variant="destructive"
                className="px-4 py-2 bg-brown justify-center items-center gap-2.5 flex"
                onClick={handleClick}>
                Go to tasks
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-col justify-between items-end gap-4 inline-flex">
          <MenuBar project_id={project_id} />
          <DeleteProject project_id={project_id} />
        </div>
      </div>
    </div>
  );
};
