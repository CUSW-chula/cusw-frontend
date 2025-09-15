'use client';
import { getCookie } from 'cookies-next';
import type React from 'react';
import { Button } from '../ui/button';
import BASE_URL from '@/lib/shared';
import { Calendar, CrownIcon, Redo2, Tag, Trash2, Users } from 'lucide-react';
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
import { DatePickerWithRangeProject } from './date-feature';
import type { Project } from '@/lib/shared';
import { AssignedProjectOwner } from './assigned-projectowner';
import { toast } from '@/hooks/use-toast';
import { AssignedProjectMember } from './assigned-projectmember';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@radix-ui/react-tooltip';
import { jwtDecode } from 'jwt-decode';
import type { ProjectRole, TaskRole } from '@/app/types/types';
import { useEffect, useState } from 'react';

interface UsersProps {
  id: string;
  name: string;
  email: string;
}

interface ProjectData {
  id: string;
  role: ProjectRole;
  tasks?: TaskData[];
}

interface TaskData {
  taskId: string;
  taskRole: TaskRole;
}

interface DeleteTaskProps {
  project_id: string;
  isMember?: boolean;
}

const DeleteProject: React.FC<DeleteTaskProps> = ({ project_id, isMember = false }) => {
  const router = useRouter();
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  const handleDeleteTask = async () => {
    const url = `${BASE_URL}/v2/projects/${project_id}`;
    const options = { method: 'DELETE', headers: { Authorization: auth } };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorMessage = await response.text();
        return;
      }
      router.push('/projects');
    } catch (error) {
      console.error(error);
    }
  };

  // ซ่อนปุ่ม delete project เมื่อเป็น member
  if (isMember) {
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <div className="w-fit h-fit py-1 px-2 bg-red-300 rounded-md border bg-white border-red justify-center items-center gap-2 inline-flex hover:bg-red group">
          <Trash2 className="h-4 w-4 text-red group-hover:text-white" />
          <div className="text-sm font-medium font-BaiJamjuree text-red group-hover:text-white">
            Delete project
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
      className="font-BaiJamjuree bg-white border-[1px] border-brown text-brown text-md"
      onClick={() => router.push('/projects')}>
      <Redo2 className="transform rotate-180 text-brown" /> Back
    </Button>
  );
};

const SumBudget = ({ budget }: { budget: number }) => {
  const cookie = getCookie('auth');

  return (
    <div className="px-3 py-2 rounded-md flex flex-col items-center gap-2">
      <span className="text-black text-sm font-medium font-BaiJamjuree">
        {budget.toLocaleString()}
      </span>
    </div>
  );
};
const SumRemaining = ({ remaining }: { remaining: number }) => {
  const cookie = getCookie('auth');
  return (
    <div className="px-3 py-2 rounded-md flex flex-col items-center gap-2">
      <span className="text-blue text-sm font-medium font-BaiJamjuree">
        {remaining.toLocaleString()}
      </span>
    </div>
  );
};
const SumAdvance = ({ advance }: { advance: number }) => {
  const cookie = getCookie('auth');

  return (
    <div className="px-3 py-2 rounded-md flex flex-col items-center gap-2">
      <span className="text-green text-sm font-medium font-BaiJamjuree">
        {advance.toLocaleString()}
      </span>
    </div>
  );
};
const SumExpense = ({ expense }: { expense: number }) => {
  const cookie = getCookie('auth');
  return (
    <div className="px-3 py-2 rounded-md flex flex-col items-center gap-2">
      <span className="text-red text-sm font-medium font-BaiJamjuree">
        {expense.toLocaleString()}
      </span>
    </div>
  );
};

type ProjectFinanceItemProps = {
  ariaLabel: string;
  color: string; // Tailwind color class
  label: string;
  value: number;
  tooltipLabel: string;
  ValueComponent: React.ComponentType<{ value: number }>;
};

const ProjectFinanceItem: React.FC<ProjectFinanceItemProps> = ({
  ariaLabel,
  color,
  label,
  value,
  tooltipLabel,
  ValueComponent,
}) => {
  return (
    <div
      aria-label={ariaLabel}
      className="h-10 justify-start items-center font-BaiJamjuree inline-flex">
      {/* Label Zone */}
      <div className="w-24 justify-start items-center gap-2 flex">
        {/* Icon */}
        <div className={`w-6 text-center text-[30px] font-semibold ${color}`}>฿</div>
        {/* Description */}
        <p className={`text-xs font-medium leading-tight ${color}`}>{label} :</p>
      </div>

      {/* Tooltip */}
      <Tooltip>
        <TooltipTrigger>
          <ValueComponent value={value} />
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="z-50 overflow-visible">
          <p
            className={`z-50 font-BaiJamjuree font-medium bg-white border border-gray-300 rounded-md px-2 py-1 text-sm ${color}`}>
            {tooltipLabel} : {value.toLocaleString()}
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

const MenuBar = ({ project, isMember }: { project: Project; isMember?: boolean }) => {
  return (
    <div className="w-[360px] p-[20px] bg-white rounded-md border border-[#6b5c56] flex-col justify-center items-start gap-2 inline-flex">
      <div aria-label="owner" className="h-10 justify-start items-center inline-flex">
        <div className="w-24 justify-start items-center gap-2 flex">
          <CrownIcon className="w-[24px] h-[24px] text-brown" />
          <p className="text-[#6b5c56] text-xs font-medium leading-tight">Owner : </p>
        </div>
        {project && <AssignedProjectOwner project={project} isMember={isMember} />}
      </div>
      <div aria-label="member" className="h-10 justify-start items-center inline-flex">
        <div className="w-24 justify-start items-center gap-2 flex">
          <Users className="w-[24px] h-[24px] text-brown" />
          <p className="text-brown text-xs font-medium font-BaiJamjuree">Member : </p>
        </div>
        {project && <AssignedProjectMember project={project} isMember={isMember} />}
      </div>

      <div aria-label="tag" className="h-fit justify-start items-start inline-flex">
        {/* Label Zone */}
        <div className="flex w-24 h-[32px] items-center gap-2">
          {/* Icon */}
          <Tag className="w-6 h-6 relative text-brown" />
          {/* Description */}
          <p className="text-brown text-xs font-medium font-BaiJamjuree">Tag : </p>
        </div>
        {project && <ButtonAddTags project_id={project.id} isMember={isMember} />}
      </div>

      <TooltipProvider>
        <ProjectFinanceItem
          ariaLabel="Budget"
          color="text-black"
          label="งบประมาณโครงการ"
          value={project.budget}
          tooltipLabel="งบประมาณโครงการ"
          ValueComponent={({ value }) => <SumBudget budget={value} />}
        />
        <ProjectFinanceItem
          ariaLabel="Expense"
          color="text-[#EF4444]"
          label="รายจ่าย"
          value={project.expense}
          tooltipLabel="รายจ่าย"
          ValueComponent={({ value }) => <SumExpense expense={value} />}
        />
        <ProjectFinanceItem
          ariaLabel="Remaining"
          color="text-blue"
          label="งบประมาณคงเหลือ"
          value={project.budget - project.expense}
          tooltipLabel="งบประมาณคงเหลือ"
          ValueComponent={({ value }) => <SumRemaining remaining={value} />}
        />
        <ProjectFinanceItem
          ariaLabel="Advance"
          color="text-[#69BCA0]"
          label="เงินยืมรองจ่าย"
          value={project.advance}
          tooltipLabel="เงินยืมรองจ่าย"
          ValueComponent={({ value }) => <SumAdvance advance={value} />}
        />
      </TooltipProvider>

      <div aria-label="date" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <Calendar className="w-6 h-6 relative text-brown" />
          {/* Describtion */}
          <p className="text-[#6b5c56] text-xs font-medium  leading-tight">Date : </p>
        </div>
        {project && <DatePickerWithRangeProject project={project} isMember={isMember} />}
      </div>
    </div>
  );
};

export const ProjectDetail = ({ project }: { project: Project }) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const Router = useRouter();
  const [isMember, setIsMember] = useState(false);

  // ตรวจสอบว่า auth token มีค่าและไม่ใช่ empty string
  useEffect(() => {
    if (!auth || auth === '') {
      console.error('No auth token found');
      return;
    }

    try {
      const userId = jwtDecode<{ id: string }>(auth);

      const fetchUserRole = async () => {
        try {
          const response = await fetch(`${BASE_URL}/v2/users/userrole/${userId.id}`, {
            headers: { Authorization: auth },
            cache: 'no-store',
          });
          if (!response.ok) throw new Error(`Failed to fetch user role: ${response.status}`);

          const data: { projects: ProjectData[]; isAdmin: boolean } = await response.json();
          const Project = data.projects.find((p) => p.id === project.id);

          setIsMember(Project?.role === 'Member');
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      };

      fetchUserRole();
    } catch (error) {
      console.error('Error decoding JWT:', error);
    }
  }, [auth, project.id]);

  const handleClick = () => {
    const url = `/projects/${project.id}`;
    Router.push(url);
  };

  const gotoGantt = () => {
    const url = `/dashboard/project/${project.id}`;
    Router.push(url);
  };

  return (
    <div className="w-full flex flex-col items-start justify-center gap-4 px-20">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-black text-5xl font-semibold font-Anuphan">Project</h1>
        <BackButton />
      </div>
      <div className="self-stretch justify-center items-start gap-7 inline-flex">
        <div className="grow shrink basis-0 min-h-[348px] max-w-[calc(100%-388px)] h-auto p-5 bg-white rounded-md border border-[#6b5c56] flex-col justify-between items-start inline-flex">
          <ProjectWorkspace project_id={project.id} />
          <div className="self-stretch h-[120px] flex-col justify-center items-end gap-3 flex">
            <hr className="my-4 w-full border-t-1 border-gray-200" />
            <div className="justify-start items-start gap-2 inline-flex">
              <Button
                className="text-black bg-white border-[#6b5c56] border"
                variant={'destructive'}
                onClick={gotoGantt}>
                View gantt chart
              </Button>
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
          <MenuBar project={project} isMember={isMember} />
          <DeleteProject project_id={project.id} isMember={isMember} />
        </div>
      </div>
    </div>
  );
};
