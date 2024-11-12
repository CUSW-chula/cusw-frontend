'use client';
import { useCallback, useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import BASE_URL, { BASE_SOCKET, type TaskManageMentOverviewProp } from '@/lib/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Calendar, ChevronRight, CircleUserRound, SquareDashed } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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

// Paths for status icons
const unassigned = '/asset/icon/unassigned.svg';
const assigned = '/asset/icon/assigned.svg';
const inrecheck = '/asset/icon/inrecheck.svg';
const underreview = '/asset/icon/inreview.svg';
const done = '/asset/icon/done.svg';

export const TaskManager = ({ project_id }: TaskManageMentOverviewProp) => {
  const [tasks, settasks] = useState<taskProps[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [projectName, setProjectName] = useState<string>('');
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const parseJsonValues = useCallback((values: any[]): taskProps[] => {
    return values.map((value) => ({
      id: value.id,
      title: value.title,
      description: value.description,
      budget: value.budget,
      advance: value.advance,
      expense: value.expense,
      status: value.status,
      parentTaskId: value.parentTaskId,
      projectId: value.projectId,
      createdById: value.createdById,
      startDate: new Date(value.startDate),
      endDate: new Date(value.endDate),
      subtasks: value.subTasks ? parseJsonValues(value.subTasks) : [],
    }));
  }, []);

  const SubtaskItem = ({
    item,
    depth = 0,
    statusIcon,
  }: { item: taskProps; depth?: number; statusIcon: string }) => {
    const hasChildren = item.subtasks && item.subtasks.length > 0;
    const isExpanded = expandedItems.has(item.id);

    useEffect(() => {
      console.log(item);
    }, [item]);

    const displayValue = (type: string, value: number) => {
      if (value <= 0) return null;
      const color =
        type === 'budget' ? 'text-black' : type === 'advance' ? 'text-[#69bca0]' : 'text-[#c30010]';
      return (
        <div className={`text-base font-medium font-['Bai Jamjuree'] leading-normal ${color}`}>
          ฿ {value.toLocaleString()}
        </div>
      );
    };

    return (
      <div className="w-full">
        <div
          className={cn(
            'flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg',
            depth > 0 && 'ml-8',
          )}>
          <button
            type="button"
            onClick={() => toggleExpand(item.id)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200">
            <ChevronRight
              className={cn('h-4 w-4 transition-transform', isExpanded && 'transform rotate-90')}
            />
          </button>
          {/* Status icon */}
          <img src={statusIcon} alt={`${item.status} Icon`} className="w-5 h-5" />
          <a href={`/tasks/${item.id}`}>
            <span className="text-sm">{item.title}</span>
          </a>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {item.tags?.join(', ')}
            </Badge>

            <GetTagList taskId={item.id} auth={auth} />

            {(item.budget > 0 || item.advance > 0 || item.expense > 0) && (
              <div className="h-auto px-3 py-2 bg-white rounded-md border border-[#6b5c56] flex items-center gap-2">
                {item.budget > 0 && displayValue('budget', item.budget)}
                {item.advance > 0 && displayValue('advance', item.advance)}
                {item.expense > 0 && displayValue('expense', item.expense)}
              </div>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleUserRound className="w-6 h-6 hover:cursor-pointer" />
                </TooltipTrigger>
                <GetAssignPeopleList taskId={item.id} auth={auth} />
              </Tooltip>
            </TooltipProvider>

            {/* Date range display */}
            {item.startDate && item.endDate && (
              <>
                <Calendar className="w-6 h-6" />
                <span>{formatDate(item.startDate, item.endDate)}</span>
              </>
            )}
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.subtasks?.map((child) => (
              <SubtaskItem key={child.id} item={child} depth={depth + 1} statusIcon={statusIcon} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch(`${BASE_URL}/projects/${project_id}`, {
          headers: {
            Authorization: auth,
          },
        });
        if (data.ok) {
          const project = await data.json();
          setProjectName(project.title);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [project_id, auth]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch(`${BASE_URL}/tasks/project/${project_id}`, {
          headers: {
            Authorization: auth,
          },
        });
        if (data.ok) {
          const tasks = await data.json();
          const parsedData = parseJsonValues(tasks);
          settasks(parsedData);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [project_id, auth, parseJsonValues]);

  const statusSections = [
    { status: 'Unassigned', icon: unassigned },
    { status: 'Assigned', icon: assigned },
    { status: 'InRecheck', icon: inrecheck },
    { status: 'UnderReview', icon: underreview },
    { status: 'Done', icon: done },
  ];

  return (
    <div className="h-auto w-[1580px] p-5 bg-white rounded-md border border-[#6b5c56] flex flex-col gap-6">
      <div className="text-black text-3xl font-semibold leading-9">{projectName}</div>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <Select>
            <SelectTrigger className="w-[150px] border-[#6b5c56]">
              <SelectValue className="text-[#6b5c56]" placeholder="Filter By: Default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Default">Filter By: Default</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="flex items-center text-[#6b5c56] border-[#6b5c56] px-3 py-1 rounded-md">
            <SquareDashed className="w-5 h-5 mr-2" />
            Select Task
          </Button>
          <Select>
            <SelectTrigger className="w-[150px] border-[#6b5c56]">
              <SelectValue className="text-[#6b5c56]" placeholder="Sort By: Start Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Start Date">Sort By: Start Date</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="flex items-center text-[#6b5c56] border-[#6b5c56] px-3 py-1 rounded-md">
            + New Task
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {statusSections.map(({ status, icon }) => (
          <div key={status}>
            <div className="flex items-center gap-2">
              <img src={icon} alt={`${status} Icon`} className="w-5 h-5" />
              <span>{status.toLowerCase()}</span>
            </div>
            <div className="w-full space-y-1">
              {tasks
                .filter((item) => item.status === status)
                .map((item) => (
                  <SubtaskItem key={item.id} item={item} statusIcon={icon} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GetTagList = ({ taskId, auth }: { taskId: string; auth: string }) => {
  const [tagList, setTagList] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch(`${BASE_URL}/tags/getassigntag/${taskId}`, {
          headers: {
            Authorization: auth,
          },
        });
        if (data.ok) {
          const tags = await data.json();
          setTagList(tags);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [auth, taskId]);

  return (
    <div className="flex flex-wrap gap-2">
      {tagList.length !== 0 ? (
        tagList.map((tag) => (
          <div key={tag.id} className="h-auto px-3 py-2 bg-white rounded-md border border-[#6b5c56] flex items-center gap-2">
            <div className="w-[18px] h-[18px] bg-[#94d0bc] rounded-full" />
            <span className="text-sm">{tag.name}</span>
          </div>
        ))
      ) : (
        null
      )}
    </div>
  );
};


const GetAssignPeopleList = ({ taskId, auth }: { taskId: string; auth: string }) => {
  interface PeopleList {
    id: string;
    name: string;
    email: string;
  }

  const [peopleList, setPeopleList] = useState<PeopleList[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch(`${BASE_URL}/tasks/getassign/${taskId}`, {
          headers: {
            Authorization: auth,
          },
        });
        if (data.ok) {
          const users = await data.json();
          setPeopleList(users);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [auth, taskId]);

  return (
    <TooltipContent>
      {peopleList.length !== 0 ? (
        peopleList.map((user) => (
          <div key={user.id} className="flex items-center gap-2">
            <span>{user.name}</span>
          </div>
        ))
      ) : (
        <span>No one assigned</span>
      )}
    </TooltipContent>
  );
};

