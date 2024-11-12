'use client';
import { use, useCallback, useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import BASE_URL, { BASE_SOCKET, type TaskManageMentOverviewProp } from '@/lib/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { ChevronRight, SquareDashed } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface taskProps {
  id: string;
  title: string;
  description: string;
  expectedBudget: number;
  realBudget: number;
  usedBudget: number;
  status: 'Unassigned' | 'Assigned' | 'UnderReview' | 'InRecheck' | 'Done';
  parentTaskId: string;
  projectId: string;
  createdById: string;
  startDate: Date;
  endDate: Date;
  tags?: string[];
  subtasks?: taskProps[];
}

// Paths for status icons
const unassigned = '/asset/icon/unassigned.svg';
const assigned = '/asset/icon/assigned.svg';
const inrecheck = '/asset/icon/inrecheck.svg';
const underreview = '/asset/icon/inreview.svg';
const done = '/asset/icon/done.svg';

export const TaskManager = ({ project_id }: TaskManageMentOverviewProp) => {
  const [tasks, settasks] = useState<taskProps[]>([]);
  const [isSubtaskSectionVisible, setIsSubtaskSectionVisible] = useState(false);
  const [isSubtaskVisible, setIsSubtaskVisible] = useState(false);
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
      expectedBudget: value.expectedBudget,
      realBudget: value.realBudget,
      usedBudget: value.usedBudget,
      status: value.status,
      parentTaskId: value.parentTaskId,
      projectId: value.projectId,
      createdById: value.createdById,
      startDate: new Date(value.startDate),
      endDate: new Date(value.endDate),
      subtasks: value.subTasks ? parseJsonValues(value.subTasks) : [],
    }));
  }, []);

  const SubtaskItem = ({ item, depth = 0 }: { item: taskProps; depth?: number }) => {
    const hasChildren = item.subtasks && item.subtasks.length > 0;
    const isExpanded = expandedItems.has(item.id);

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
          <a href={`/tasks/${item.id}`}>
            <span className="text-sm">{item.title}</span>
          </a>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {item.status}
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              ใบรับเงินผ่าสอน
            </Badge>
            <span
              className={cn(
                'font-medium',
                item.realBudget > 0 ? 'text-green-600' : 'text-red-600',
              )}>
              {item.realBudget > 0 ? '+' : ''}
              {item.realBudget ? item.realBudget.toLocaleString() : '0'}
            </span>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.subtasks?.map((child) => (
              <SubtaskItem key={child.id} item={child} depth={depth + 1} />
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


  const handleToggleSubtaskSection = () => {
    setIsSubtaskSectionVisible(!isSubtaskSectionVisible);
  };

  const handleToggleSubtask = () => {
    setIsSubtaskVisible(!isSubtaskVisible);
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
        <div className="flex items-center gap-2">
          <img src={unassigned} alt="Unassigned Icon" className="w-5 h-5" />
          <span>unassigned</span>
          <div className="w-full space-y-1">
          {tasks.map((item) => (
            <SubtaskItem key={item.id} item={item}  />
          ))}
        </div>

        </div>
        <div className="flex items-center gap-2">
          <img src={assigned} alt="Assigned Icon" className="w-5 h-5" />
          <span>assigned</span>
          <div className="w-full space-y-1">
          {tasks.map((item) => (
            <SubtaskItem key={item.id} item={item}  />
          ))}
        </div>
        </div>
        <div className="flex items-center gap-2">
          <img src={inrecheck} alt="In Recheck Icon" className="w-5 h-5" />
          <span>in recheck</span>
          <div className="w-full space-y-1">
          {tasks.map((item) => (
            <SubtaskItem key={item.id} item={item}  />
          ))}
        </div>
        </div>
        <div className="flex items-center gap-2">
          <img src={underreview} alt="Under Review Icon" className="w-5 h-5" />
          <span>under review</span>
          <div className="w-full space-y-1">
          {tasks.map((item) => (
            <SubtaskItem key={item.id} item={item}  />
          ))}
        </div>
        </div>
        <div className="flex items-center gap-2">
          <img src={done} alt="Done Icon" className="w-5 h-5" />
          <span>done</span>
          <div className="w-full space-y-1">
          {tasks.map((item) => (
            <SubtaskItem key={item.id,item.status === "Done"} item={item} it  />
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};
