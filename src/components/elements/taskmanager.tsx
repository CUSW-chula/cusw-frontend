'use client';
import { useCallback, useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import BASE_URL, { BASE_SOCKET, type TaskManageMentOverviewProp } from '@/lib/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Calendar, ChevronRight, ChevronsRight, CircleUserRound, SquareDashed,  } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useRouter } from 'next/navigation';
import { Badge } from '../ui/badge';

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
const underreview = '/asset/icon/underreview.svg';
const done = '/asset/icon/done.svg';

export const TaskManager = ({ project_id }: TaskManageMentOverviewProp) => {
  const [tasks, settasks] = useState<taskProps[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [projectName, setProjectName] = useState<string>('');
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const router = useRouter();

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

  const handleCreateTask = async () => {
    const url = `${BASE_URL}/tasks/`;
    const options = {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '',
        description: '',
        expectedBudget: 0,
        realBudget: 0,
        parentTaskId: '',
        usedBudget: 1,
        status: 'Unassigned',
        projectId: project_id,
        startDate: new Date(),
        endDate: new Date(),
      }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      router.push(`/tasks/${data.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const SubtaskItem = ({
    item,
    depth = 0,
    statusIcon,
  }: { item: taskProps; depth?: number; statusIcon: string }) => {
    const hasChildren = item.subtasks && item.subtasks.length > 0;
    const isExpanded = expandedItems.has(item.id);
  
    const displayValue = (type: string, value: number) => {
      if (value <= 0) return null;
      const color =
        type === 'budget' ? 'text-black' : type === 'advance' ? 'text-[#69bca0]' : 'text-[#c30010]';
      return (
        <div className="h-fit px-1 flex items-center justify-center gap-2 rounded-md border border-[#6b5c56]">
          <div className={`text-2xl font-semibold font-BaiJamjuree leading-normal ${color}`}>
            ฿
          </div>
          <div className={`text-base font-medium font-BaiJamjuree leading-normal ${color}`}>
            {value.toLocaleString()}
          </div>
        </div>
      );
    };
  
    const getStatusIcon = (status: string) => {
      const section = statusSections.find((section) => section.status === status);
      return section ? section.icon : unassigned; // Fallback icon if status not found
    };
  
    return (
      <div className="w-full font-BaiJamjuree">
        <div
          className={cn(
            'flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg',
            depth > 0 && 'pl-8' // Dynamic margin based on depth
          )}
        >
          <div className="flex items-center gap-2 w-full" style={{ marginLeft: `${depth * 16}px` }}>
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleExpand(item.id)}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200"
            >
              {item.parentTaskId ? (
                <ChevronRight className={cn('h-4 w-4 transition-transform', isExpanded && 'transform rotate-90')} />
              ) : (
                <ChevronsRight className={cn('h-4 w-4 transition-transform', isExpanded && 'transform rotate-90')} />
              )}
            </button>
          )}
          <img src={getStatusIcon(item.status)} alt={`${item.status} Icon`} className="w-5 h-5" />
          <a href={`/tasks/${item.id}`}>
            <span className="text-sm font-BaiJamjuree">{item.title}</span>
          </a>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <GetTagList taskId={item.id} auth={auth} />
            {(item.budget > 0 || item.advance > 0 || item.expense > 0) && (
              <div className="h-fit bg-white justify-start items-center gap-2 inline-flex">
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
  
            {item.startDate && item.endDate && (
              <>
                <Calendar className="w-6 h-6" />
                <span>{formatDate(item.startDate, item.endDate)}</span>
              </>
            )}
          </div>
        </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.subtasks?.map((child) => (
              <SubtaskItem
                key={child.id}
                item={child}
                depth={depth + 1} // Increase depth for child tasks
                statusIcon={getStatusIcon(child.status)}
              />
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
    { status: 'Unassigned', displayName: 'Unassigned', icon: unassigned },
    { status: 'Assigned', displayName: 'Assigned', icon: assigned },
    { status: 'InRecheck', displayName: 'In Recheck', icon: inrecheck },
    { status: 'UnderReview', displayName: 'Under Review', icon: underreview },
    { status: 'Done', displayName: 'Done', icon: done },
  ];

  return (
    <div className="h-auto w-[1580px] p-5 font-BaiJamjuree bg-white rounded-md border border-[#6b5c56] flex flex-col gap-6">
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
            onClick={handleCreateTask}
            className="flex items-center text-[#6b5c56] border-[#6b5c56] px-3 py-1 rounded-md">
            + New Task
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {statusSections.map(({ status, displayName, icon }) => (
          <div key={status}>
            <div className="flex items-center gap-2">
              <img src={icon} alt={`${status} Icon`} className="w-5 h-5" />
              <span>{displayName.toLowerCase()}</span> {/* Use displayName here */}
            </div>
            <div className="w-full space-y-1">
              {tasks
                .filter((item) => item.status === status) // Match with the status property
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
      {tagList.length !== 0
        ? tagList.map((tag) => (
          <Badge
          key={tag.id}
          variant="destructive"
          className="h-7 min-w-fit px-2 py-2 flex items-center gap-1 justify-center bg-emerald-300  text-black ">
          <span className="text-base font-medium font-BaiJamjuree">{tag.name}</span>
        </Badge>
          ))
        : null}
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
