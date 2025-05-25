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

interface UsersProps {
  id: string;
  name: string;
  email: string;
}
interface DeleteTaskProps {
  project_id: string;
}

const DeleteProject: React.FC<DeleteTaskProps> = ({ project_id }) => {
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

        return; // Exit early if there's an error
      }
      // Success: Redirect without parsing the response
      router.push('/projects');
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
      className="font-BaiJamjuree bg-white border-2 border-brown text-brown text-sm"
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

const MenuBar = ({ project }: { project: Project }) => {
  return (
    <div className="min-h-[350px] min-w-[395px] p-5 bg-white rounded-md border border-[#6b5c56] flex-col justify-between items-start gap-4 inline-flex">
      <div aria-label="owner" className="h-10 justify-start items-center inline-flex">
        <div className="w-24 justify-start items-center gap-2 flex">
          <CrownIcon className="w-[24px] h-[24px] text-black" />

          <div className="text-[#6b5c56] text-xs font-medium leading-tight">Owner : </div>
        </div>
        {project && <AssignedProjectOwner project={project} />}
      </div>
      <div aria-label="member" className="h-10 justify-start items-center inline-flex">
        <div className="w-24 justify-start items-center gap-2 flex">
          <Users className="w-[24px] h-[24px] text-black" />

          <div className="text-[#6b5c56] text-xs font-medium leading-tight">Member : </div>
        </div>
        {project && <AssignedProjectMember project={project} />}
      </div>
      <div aria-label="tag" className="justify-start items-center inline-flex flex-wrap w-full">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex self-start ">
          {/* Icon */}
          <Tag className="w-6 h-6 relative" />
          {/* Description */}
          <div className="text-[#6b5c56] text-xs font-medium  leading-tight">Tag : </div>
        </div>
        <div className="flex w-[253.67px] ">
          {project && <ButtonAddTags project_id={project.id} />}
        </div>
      </div>

      <div aria-label="Budget" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <div className="w-6 text-center text-black text-[30px] font-BaiJamjuree font-semibold">
            ฿
          </div>
          {/* Describtion */}
          <div className="text-[#6b5c56] text-xs font-medium font-BaiJamjuree leading-tight">
            งบประมาณโครงการ :{' '}
          </div>
        </div>
        <SumBudget budget={project.budget} />
      </div>

      <div
        aria-label="Advance"
        className="h-10 justify-start font-BaiJamjuree items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <div className="w-6 text-center text-green text-[30px] font-semibold">฿</div>
          {/* Describtion */}
          <div className="text-green text-xs font-medium  leading-tight">เงินยืมรองจ่าย : </div>
        </div>
        <SumAdvance advance={project.advance} />
      </div>

      <div
        aria-label="Expense"
        className="h-10 justify-start items-center font-BaiJamjuree inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <div className="w-6 text-center text-red text-[30px] font-semibold">฿</div>
          {/* Describtion */}
          <div className="text-red text-xs font-medium  leading-tight">รายจ่าย : </div>
        </div>
        <SumExpense expense={project.expense} />
      </div>

      <div aria-label="date" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <Calendar className="w-6 h-6 relative" />
          {/* Describtion */}
          <div className="text-[#6b5c56] text-xs font-medium  leading-tight">Date : </div>
        </div>
        {project && <DatePickerWithRangeProject project={project} />}
      </div>
    </div>
  );
};

export const ProjectDetail = ({ project }: { project: Project }) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const Router = useRouter();

  const handleClick = () => {
    const url = `/projects/${project.id}`;
    Router.push(url);
  };

  return (
    <div className="max-h-[414px] px-20 flex-col justify-start items-start gap-[18px] inline-flex w-screen">
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
          <div className="self-stretch h-full flex-col justify-start items-start gap-[18px] fle ">
            <ProjectWorkspace project_id={project.id} />
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
          <MenuBar project={project} />
          <DeleteProject project_id={project.id} />
        </div>
      </div>
    </div>
  );
};
