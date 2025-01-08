'use client';
import { useCallback, useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import BASE_URL, { BASE_SOCKET, type TaskManageMentOverviewProp } from '@/lib/shared';
import { Calendar, ChevronRight, ChevronsRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { useRouter } from 'next/navigation';

interface Tag {
  id: string;
  name: string;
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

// Paths for status icons
const unassigned = '/asset/icon/unassigned.svg';
const assigned = '/asset/icon/assigned.svg';
const inrecheck = '/asset/icon/inrecheck.svg';
const underreview = '/asset/icon/underreview.svg';
const done = '/asset/icon/done.svg';
const statusSections = [
  { status: 'Unassigned', displayName: 'Unassigned', icon: unassigned },
  { status: 'Assigned', displayName: 'Assigned', icon: assigned },
  { status: 'InRecheck', displayName: 'In Recheck', icon: inrecheck },
  { status: 'UnderReview', displayName: 'Under Review', icon: underreview },
  { status: 'Done', displayName: 'Done', icon: done },
];

const cookie = getCookie('auth');
const auth = cookie?.toString() ?? '';

export const TaskManager = ({ project_id }: TaskManageMentOverviewProp) => {
  const router = useRouter();
  const [tasks, settasks] = useState<taskProps[]>([]);
  const [showTasks, setShowTasks] = useState<taskProps[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  // const [isExportTasks, setIsExportTasks] = useState<boolean>(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set()); //the list of task which is expanded
  const [visaulExportValue, setVisaulExportValue] = useState<Set<string>>(new Set());
  const [exportValue, setExportValue] = useState<taskProps[]>([]);

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
  }, [project_id]);

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
          if (showTasks.length === 0) setShowTasks(parsedData);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [project_id, parseJsonValues, showTasks]);

  const ProjectController = () => {
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const sortItem = [
      {
        value: 'StartDate123',
        label: 'Start date ↓',
      },
      {
        value: 'StartDate321',
        label: 'Start date ↑',
      },
      {
        value: 'EndDate123',
        label: 'End date ↓',
      },
      {
        value: 'EndDate321',
        label: 'End date ↑',
      },
    ];

    // get all tag
    useEffect(() => {
      const fetchTagData = async () => {
        const url = `${BASE_URL}/tags/`;
        const options = {
          method: 'GET',
          headers: {
            Authorization: auth,
          },
        };

        try {
          const response = await fetch(url, options);
          const data = (await response.json()) as Tag[];
          setAllTags(data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchTagData();
    }, []);

    // the main function of filter task
    const handleFilter = async (tag_id: string) => {
      //get task have this tag
      const fetchData = async (tag_id: string) => {
        const url = `${BASE_URL}/tags/getassigntask/${tag_id}`;
        const options = { method: 'GET', headers: { Authorization: auth } };
        try {
          const response = await fetch(url, options);
          const data = await response.json();

          // Map the data to extract the task ids as a string array
          const tasksHavetag = data.map((task: { id: string }) => task.id);
          // console.log('taskIds: ', taskIds);

          // Return the task ids array
          console.log(tasksHavetag);
          return tasksHavetag;
        } catch (error) {
          console.error('Error fetching data:', error);
          // You might want to return an empty array in case of error
          return [];
        }
      };

      const setTaskAssignedByTag = (tasks: taskProps[], taskIds: string[]): taskProps[] => {
        let matchedTasks: taskProps[] = [];

        for (const task of tasks) {
          // Check if the current task's id matches the taskIds list
          if (taskIds.includes(task.id)) {
            matchedTasks.push(task);
          }

          // If there are subtasks, call the function recursively on the subtasks
          if (task.subtasks && task.subtasks.length > 0) {
            matchedTasks = [
              ...matchedTasks,
              ...setTaskAssignedByTag(task.subtasks, taskIds), // Recursive call
            ];
          }
        }
        setShowTasks(matchedTasks);
        return matchedTasks;
      };

      if (tag_id === 'all') {
        setShowTasks(tasks);
        return;
      }
      const tasksHavetag = await fetchData(tag_id);

      setTaskAssignedByTag(tasks, tasksHavetag);
    };
    // the main function of sort task
    const handleSort = (value: string) => {
      const sortByStartDate = async (tasks: taskProps[], inOrder: boolean) => {
        const sorted = [...tasks].sort((task1, task2) => {
          if (task1.startDate === null) return 1; // If startDate is null, move to the end
          if (task2.startDate === null) return -1;
          return inOrder
            ? new Date(task1.startDate).getTime() - new Date(task2.startDate).getTime()
            : new Date(task2.startDate).getTime() - new Date(task1.startDate).getTime();
        });
        setShowTasks(sorted);
      };
  
      const sortByEndDate = async (tasks: taskProps[], inOrder: boolean) => {
        const sorted = [...tasks].sort((task1, task2) => {
          if (task1.endDate === null) return 1; // If startDate is null, move to the end
          if (task2.endDate === null) return -1;
          return inOrder
            ? new Date(task1.endDate).getTime() - new Date(task2.endDate).getTime()
            : new Date(task2.endDate).getTime() - new Date(task1.endDate).getTime();
        });
        setShowTasks(sorted);
      };

      value === 'StartDate123'
        ? sortByStartDate(showTasks, true)
        : value === 'StartDate321'
          ? sortByStartDate(showTasks, false)
          : value === 'EndDate123'
            ? sortByEndDate(showTasks, true)
            : value === 'EndDate321'
              ? sortByEndDate(showTasks, false)
              : null;
    };

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

    return (
      <div className="flex items-center justify-between w-full mb-3">
        {/* Filter Task */}
        <div className="flex items-center gap-4">
          <Select onValueChange={(value) => handleFilter(value)}>
            <SelectTrigger className="w-[150px] border-brown">
              <SelectValue className="text-brown" placeholder="Filter by: Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="default" value="all" className="font-BaiJamjuree">
                Default
              </SelectItem>
              {allTags.map((tag: Tag) => (
                <SelectItem key={tag.id} value={tag.id} className="font-BaiJamjuree">
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Sort and New Task  */}
        <div className="flex items-center gap-4">
          {/* {isExportTasks && (
            <Button
              variant="outline"
              className="h-10 px-4 bg-[#eefdf7] rounded-md border border-brown justify-center items-center flex text-green text-base font-semibold font-BaiJamjuree leading-normal hover:cursor-pointer">
              Export
            </Button>
          )} */}
          <Button
            variant="outline"
            className="h-10 px-4 bg-white rounded-md border border-brown justify-center items-center flex text-brown text-base font-normal font-BaiJamjuree leading-normal hover:cursor-pointer">
            Select tasks
          </Button>
          <Select onValueChange={(value) => handleSort(value)}>
            <SelectTrigger className="w-[150px] border-brown">
              <SelectValue className="text-brown" placeholder="Sort by: Start date" />
            </SelectTrigger>
            <SelectContent>
              {sortItem.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  Sort by: {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleCreateTask}
            className="flex items-center text-brown border-brown px-3 py-1 rounded-md">
            + New task
          </Button>
        </div>
      </div>
    );
  };

  const SubtaskItem = ({
    item,
    depth = 0,
  }: {
    item: taskProps;
    depth?: number;
    statusIcon: string;
  }) => {
    const hasChildren = item.subtasks && item.subtasks.length > 0;
    const isExpanded = expandedItems.has(item.id);

    //format Date display
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

    //display Money
    const displayValue = (type: string, value: number) => {
      if (value <= 0) return null;
      const color =
        type === 'budget'
          ? 'text-black'
          : type === 'advance'
            ? 'text-green'
            : type === 'expense'
              ? 'text-red'
              : null;
      const textBaseClass = `font-BaiJamjuree leading-normal ${color}`;
      return (
        <div className="h-10 px-3 py-2 bg-white rounded-md border border-brown justify-start items-center gap-2 inline-flex">
          <div className={`text-2xl font-semibold ${textBaseClass}`}>฿</div>
          <div className={`text-base font-medium ${textBaseClass}`}>{value.toLocaleString()}</div>
        </div>
      );
    };

    //display task status
    const getStatusIcon = (status: string) => {
      const section = statusSections.find((section) => section.status === status);
      return section ? section.icon : unassigned; // Fallback icon if status not found
    };

    const Chevron = ({
      task,
    }: {
      task: taskProps;
    }) => {
      //expand subtask
      const toggleExpand = (id: string) => {
        setExpandedItems((prev) => {
          const newSet = new Set(prev);
          newSet.has(id) ? newSet.delete(id) : newSet.add(id);
          return newSet;
        });
      };

      // const handleChecked = async (task: taskProps) => {
      //   if (!visaulExportValue.has(task.id)) {
      //     recursiveCheck(task, true);
      //     const newSet = [...exportValue, task];
      //     setExportValue(newSet);
      //     // setExportValue((prev) => {
      //     //   const newSet = new Set(prev);
      //     //   newSet.add(task);
      //     //   return newSet;
      //     // });
      //   } else {
      //     if (!visaulExportValue.has(task.parentTaskId)) recursiveCheck(task, false);
      //     const newSet = exportValue.filter((item) => item !== task);
      //     setExportValue(newSet);
      //     // setExportValue((prev) => {
      //     //   const newSet = new Set(prev);
      //     //   newSet.delete(task);
      //     //   return newSet;
      //     // });
      //   }
      // };

      const recursiveCheck = (task: taskProps, goTo: boolean) => {
        // setVisaulExportValue((prev) => {
        //   const newSet = new Set(prev);
        //   goTo ? newSet.add(task.id) : newSet.delete(task.id);
        //   return newSet;
        // });
        if (task.subtasks && task.subtasks.length >= 0) {
          task.subtasks.map((item) => {
            recursiveCheck(item, goTo);
          });
        }
      };

      return (
        <div>
          {/* {isExportTasks ? (
            <Checkbox
              className="mr-3"
              checked={visaulExportValue.has(task.id)}
              onCheckedChange={() => handleChecked(task)}
            />
          ) : ( */}
            <button
              type="button"
              onClick={() => toggleExpand(item.id)}
              className={`w-6 h-6 mr-1 flex items-center justify-center rounded hover:bg-gray-200 ${
                hasChildren ? 'visible' : 'invisible'
              }`}>
              {item.parentTaskId ? (
                <ChevronRight
                  className={`h-4 w-4 transition-transform${isExpanded ? 'transform rotate-90' : ''}`}
                />
              ) : (
                <ChevronsRight
                  className={`h-4 w-4 transition-transform${isExpanded ? 'transform rotate-90' : ''}`}
                />
              )}
            </button>
          {/* )} */}
        </div>
      );
    };

    //for subTask
    return (
      <div className="w-full font-BaiJamjuree">
        <div
          className={cn(
            'flex items-center hover:bg-gray-50',
            depth > 0, // Dynamic margin based on depth
          )}>
          <div
            className="flex items-center w-full h-fit my-1.5"
            style={{ marginLeft: `${depth * 24 + 24}px` }}>
            <div className="inline-flex w-7/12 items-center">
              <Chevron task={item} />

              <img
                src={getStatusIcon(item.status)}
                alt={`${item.status} Icon`}
                className="w-6 h-6 mr-2"
              />
              <div
                onClick={() => router.push(`/tasks/${item.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault(); // Prevent default scroll behavior for space key
                    router.push(`/tasks/${item.id}`);
                  }
                }}
                className="cursor-pointer w-full">
                <span className="flex text-black text-base font-normal font-BaiJamjuree w-11/12">
                  {item.title}
                </span>
              </div>
            </div>

            <div className="w-5/12 flex gap-1 relative justify-end items-center">
              <GetTagList taskId={item.id} auth={auth} />
              {(item.budget > 0 || item.advance > 0 || item.expense > 0) && (
                <div>
                  {item.budget > 0 && displayValue('budget', item.budget)}
                  {item.advance > 0 && displayValue('advance', item.advance)}
                  {item.expense > 0 && displayValue('expense', item.expense)}
                </div>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <User className="h-8 w-8 p-1 text-brown border border-brown rounded-full hover:cursor-pointer" />
                  </TooltipTrigger>
                  <GetAssignPeopleList taskId={item.id} auth={auth} />
                </Tooltip>
              </TooltipProvider>

              {item.startDate && item.endDate && (
                <div
                  className="inline-flex gap-1 min-w-60"
                  title={formatDate(item.startDate, item.endDate)}>
                  <Calendar className="w-6 h-6 whitespace-nowrap" />
                  <span>{formatDate(item.startDate, item.endDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
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

  return (
    <div className="h-auto w-full p-11 font-BaiJamjuree bg-white rounded-md border border-brown flex flex-col">
      <header className="h-9 text-black text-3xl font-semibold leading-9 mb-6">
        {projectName}
      </header>
      {/* Controller section */}
      <ProjectController />
      {/* Content section */}
      {statusSections.map(({ status, displayName, icon }) => (
        <div key={status}>
          {/* Status Title */}
          <div className="flex items-center gap-2 border-b border-gray-300 py-3">
            <img src={icon} alt={`${status} Icon`} className="w-6 h-6" />
            <span className="text-black text-sm font-medium font-BaiJamjuree">{displayName}</span>
          </div>
          {/* Tasks in there group */}
          <div className="w-full block">
            {showTasks
              .filter((item) => item.status === status) // Match with the status property
              .map((item) => (
                <SubtaskItem key={item.id} item={item} statusIcon={icon} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// show tag in task
const GetTagList = ({ taskId, auth }: { taskId: string; auth: string }) => {
  const [tagList, setTagList] = useState<Array<{ id: string; name: string }>>([]);

  //What tags does this task have
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
    <div className="relative flex">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild className="cursor-pointer flex max-w-32">
            <div>
              {tagList.length !== 0
                ? tagList.slice(0, 3).map((tag, index) => (
                    <Badge
                      key={tag.id}
                      variant="destructive"
                      className="h-10 w-28 px-3 py-2 bg-[#eefdf7] rounded-3xl border border-green absolute self-center flex justify-center right-0 transition-transform"
                      style={
                        {
                          transform: `translateX(${index * -28}px)`, // Custom CSS property for group hover
                        } as React.CSSProperties
                      }>
                      <span className="text-green text-base font-semibold font-BaiJamjuree leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
                        {tag.name}
                      </span>
                    </Badge>
                  ))
                : null}
            </div>
          </TooltipTrigger>
          <TooltipContent className="flex flex-col gap-1">
            {tagList.length !== 0
              ? tagList.map((tag) => (
                  <div key={tag.id}>
                    <Badge
                      variant="destructive"
                      className="h-10 px-3 py-2 bg-[#eefdf7] rounded-3xl border border-green ">
                      <span className="text-green text-base font-semibold font-BaiJamjuree leading-normal whitespace-nowrap">
                        {tag.name}
                      </span>
                    </Badge>
                  </div>
                ))
              : null}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

// show all assignmentlist
const GetAssignPeopleList = ({
  taskId,
  auth,
}: {
  taskId: string;
  auth: string;
}) => {
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
