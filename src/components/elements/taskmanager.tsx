'use client';
import { useCallback, useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import BASE_URL, { type TaskManageMentOverviewProp } from '@/lib/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

import type { TaskProps, TagProps } from '@/app/types/types';
import { Money } from '@/components/elements/taskManagement/money';
import { Tag } from '@/components/elements/taskManagement/tag';
import { Assigned } from '@/components/elements/taskManagement/assigned';
import { TaskDate } from '@/components/elements/taskManagement/taskDate';
import { TaskTitle } from '@/components/elements/taskManagement/taskTitle';

// Predefined icon paths
const ICONS = {
  Unassigned: '/asset/icon/unassigned.svg',
  Assigned: '/asset/icon/assigned.svg',
  InRecheck: '/asset/icon/inrecheck.svg',
  UnderReview: '/asset/icon/underreview.svg',
  Done: '/asset/icon/done.svg',
};

const statusSections = [
  { status: 'Unassigned', displayName: 'Unassigned', icon: ICONS.Unassigned },
  { status: 'Assigned', displayName: 'Assigned', icon: ICONS.Assigned },
  { status: 'InRecheck', displayName: 'In Recheck', icon: ICONS.InRecheck },
  { status: 'UnderReview', displayName: 'Under Review', icon: ICONS.UnderReview },
  { status: 'Done', displayName: 'Done', icon: ICONS.Done },
];

const cookie = getCookie('auth');
const auth = cookie?.toString() ?? '';

export const TaskManager = ({ project_id }: TaskManageMentOverviewProp) => {
  const router = useRouter();
  const [tasks, settasks] = useState<TaskProps[]>([]);
  const [showTasks, setShowTasks] = useState<TaskProps[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [isTaskSelectionActive, setIsTaskSelectionActive] = useState<boolean>(false); // the status "Select Task" button has been pressed or not
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set()); //Set of taskID that have been expanded
  const [visibleExportTasks, setVisibleExportTasks] = useState<Set<string>>(new Set()); //Tracks taskID visible for export
  const [exportedTasks, setExportedTasks] = useState<TaskProps[]>([]); //Stores the list of tasks selected for export

  const [allTags, setAllTags] = useState<TagProps[]>([]);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const parseJsonValues = useCallback((values: any[]): TaskProps[] => {
    return values.map((value) => ({
      id: value.id,
      title: value.title,
      description: value.description,
      statusBudget: value.statusBudget,
      budget: value.budget,
      advance: value.advance,
      expense: value.expense,
      status: value.status,
      parentTaskId: value.parentTaskId,
      projectId: value.projectId,
      createdById: value.createdById,
      startDate: new Date(value.startDate),
      endDate: new Date(value.endDate),
      owner: value.owner,
      members: value.members,
      tags: value.tags,
      subtasks: value.subtasks ? parseJsonValues(value.subtasks) : [],
      emojis: value.emojis,
    }));
  }, []);

  useEffect(() => {
    //get all data of project from db
    const fetchData = async () => {
      try {
        const data = await fetch(`${BASE_URL}/v2/projects/${project_id}`, {
          headers: {
            Authorization: auth,
          },
        });
        if (data.ok) {
          const project = await data.json();
          setProjectName(project.title);

          const parsedData = parseJsonValues(project.tasks);
          settasks(parsedData);
          setShowTasks(parsedData);
        }
      } catch (error) {
        console.error(error);
      }
    };
    //get all tags of tasks from db
    const fetchTagData = async () => {
      const url = `${BASE_URL}/v2/tags/`;
      const options = {
        method: 'GET',
        headers: {
          Authorization: auth,
        },
      };

      try {
        const response = await fetch(url, options);
        const data = (await response.json()) as TagProps[];
        setAllTags(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTagData();
    fetchData();
  }, [parseJsonValues, project_id]);

  const ProjectController = () => {
    const Filter = () => {
      const handleFilter = async (tagID: string) => {
        const filterByTag = async (tasks: TaskProps[], tag: TagProps): Promise<TaskProps[]> => {
          const filteredTasks: TaskProps[] = [];

          // Iterate through all tasks
          for (const task of tasks) {
            // Check if the task itself has the matching tag
            if (task.tags?.some((item) => item.id === tag.id)) {
              filteredTasks.push(task);
            }

            // If the task has subtasks, recursively filter them
            else if (task.subtasks && task.subtasks?.length > 0) {
              const subtaskResults = await filterByTag(task.subtasks, tag);
              filteredTasks.push(...subtaskResults); // Append the results
            }
          }

          return filteredTasks;
        };

        const tag = allTags.find((tag) => tag.id === tagID) || {
          id: 'all',
          name: 'Default',
        };

        // Call the recursive function and update the state
        const tasksWithTag = await filterByTag(tasks, tag);
        setShowTasks(tasksWithTag);
      };
      return (
        <Select
          onValueChange={(value) => {
            handleFilter(value);
          }}>
          <SelectTrigger className="w-[150px] border-brown">
            <SelectValue className="text-brown" placeholder="Filter by: Tag" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem key="default" value="all" className="font-BaiJamjuree">
              Default
            </SelectItem>
            {allTags.map((tag: TagProps) => (
              <SelectItem key={tag.id} value={tag.id} className="font-BaiJamjuree">
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    };

    const Export = () => {
      const handleSaveAs = () => {
        const expandItemsRecursively = (tasks: TaskProps[]) => {
          const expandTask = (task: TaskProps) => {
            setExpandedTaskIds((prev) => {
              const newSet = new Set(prev);
              if (!newSet.has(task.id)) {
                newSet.add(task.id);
              }
              return newSet;
            });

            if (task.subtasks?.length) {
              expandItemsRecursively(task.subtasks);
            }
          };
          tasks.forEach(expandTask);
        };
        setIsTaskSelectionActive(!isTaskSelectionActive);
        if (!isTaskSelectionActive) expandItemsRecursively(showTasks);
      };
      const handleSelectTasks = (value: string) => {};

      const handleCancle = () => {
        setIsTaskSelectionActive(!isTaskSelectionActive);
        setExportedTasks([]);
        setVisibleExportTasks(new Set());
      };

      const exportAsFile = (tasks: TaskProps[]) => {
        const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
      };

      const exportAsTemplate = (tasks: TaskProps[]) => {
        const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
      };
      return (
        <>
          {isTaskSelectionActive && (
            <>
              <Select onValueChange={() => handleCancle()}>
                <SelectTrigger className="w-36 border-brown bg-[#eefdf7]">
                  <SelectValue className="text-brown" placeholder="Save as" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    key="saveFile"
                    value="saveFile"
                    onClick={() => exportAsFile(exportedTasks)}>
                    .CSV
                  </SelectItem>
                  <SelectItem
                    key="saveTemplate"
                    value="saveTemplate"
                    onClick={() => exportAsTemplate(exportedTasks)}>
                    Template
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="h-10 px-4 bg-rose-200 rounded-md border border-brown justify-center items-center flex text-red text-base font-semibold font-BaiJamjuree leading-normal hover:cursor-pointer"
                onClick={() => handleCancle()}>
                Cancel
              </Button>
            </>
          )}
          {!isTaskSelectionActive && (
            <Button
              onClick={() => handleSaveAs()}
              className="text-brown border-brown px-3 py-1 rounded-md bg-white border hover:bg-slate-100">
              Select tasks
            </Button>
          )}
        </>
      );
    };

    const Sort = () => {
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
      const handleSort = (value: string) => {
        const sortTasksByDate = (
          tasks: TaskProps[],
          dateType: 'startDate' | 'endDate',
          inOrder: boolean,
        ): TaskProps[] => {
          return tasks
            .filter((task) => task[dateType] !== null) // Filter out tasks with null dates
            .sort((task1, task2) => {
              const date1 = new Date(task1[dateType]).getTime();
              const date2 = new Date(task2[dateType]).getTime();
              return inOrder ? date1 - date2 : date2 - date1; // Sort in ascending or descending order
            })
            .concat(tasks.filter((task) => task[dateType] === null)); // Add tasks with null dates at the end
        };

        let sortedTasks: TaskProps[];

        switch (value) {
          case 'StartDate123':
            sortedTasks = sortTasksByDate(showTasks, 'startDate', true);
            break;
          case 'StartDate321':
            sortedTasks = sortTasksByDate(showTasks, 'startDate', false);
            break;
          case 'EndDate123':
            sortedTasks = sortTasksByDate(showTasks, 'endDate', true);
            break;
          case 'EndDate321':
            sortedTasks = sortTasksByDate(showTasks, 'endDate', false);
            break;
          default:
            return; // Do nothing if the value is not recognized
        }

        setShowTasks(sortedTasks); // Update the state with sorted tasks
      };
      return (
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
      );
    };

    const CreateTask = () => {
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
        <Button
          variant="outline"
          onClick={handleCreateTask}
          className="flex items-center text-brown border-brown px-3 py-1 rounded-md">
          + New task
        </Button>
      );
    };

    return (
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-4">
          <Filter />
          <Export />
        </div>

        <div className="flex items-center gap-4">
          <Sort />
          <CreateTask />
        </div>
      </div>
    );
  };

  const Task = ({
    item,
    depth = 0,
  }: {
    item: TaskProps;
    depth?: number;
  }) => {
    const hasChildren = item.subtasks && item.subtasks.length > 0;
    const isExpanded = expandedTaskIds.has(item.id);
    return (
      <>
        <div className="flex items-center hover:bg-gray-50">
          <div
            className="flex items-center w-full h-fit my-1.5"
            style={{ marginLeft: `${depth * 24 + 24}px` }}>
            <TaskTitle 
              item={item} 
              expandedTaskIds={expandedTaskIds}
              setExpandedTaskIds={setExpandedTaskIds}
              isTaskSelectionActive={isTaskSelectionActive}
              visibleExportTasks={visibleExportTasks}
              setVisibleExportTasks={setVisibleExportTasks}
              exportedTasks={exportedTasks}
              setExportedTasks={setExportedTasks}
            />

            <div className="w-5/12 flex gap-1 relative justify-end items-center">
              <Tag item={item} />
              <Money item={item} />
              <Assigned item={item} />
              <TaskDate item={item} />
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {item.subtasks?.map((child) => (
              <Task
                key={child.id}
                item={child}
                depth={depth + 1} // Increase depth for child tasks
                // statusIcon={getStatusIcon(child.status)}
              />
            ))}
          </div>
        )}
      </>
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
                <Task key={item.id} item={item} 
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

//display task status
    // const getStatusIcon = (status: string) => {
    //   const section = statusSections.find((section) => section.status === status);
    //   return section ? section.icon : ICONS.Unassigned; // Fallback icon if status not found
    // };
    // const Chevron = ({
    //   task,
    // }: {
    //   task: TaskProps;
    // }) => {
    //   //expand subtask
    //   const toggleExpand = (id: string) => {
    //     setExpandedTaskIds((prev) => {
    //       const newSet = new Set(prev);
    //       newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    //       return newSet;
    //     });
    //   };

    //   const handleChecked = async (task: TaskProps) => {
    //     if (!visibleExportTasks.has(task.id)) {
    //       recursiveCheck(task, true);
    //       const newSet = [...exportedTasks, task];
    //       setExportedTasks(newSet);
    //     } else {
    //       if (!visibleExportTasks.has(task.parentTaskId)) recursiveCheck(task, false);
    //       const newSet = exportedTasks.filter((item) => item !== task);
    //       setExportedTasks(newSet);
    //     }
    //   };

    //   const recursiveCheck = (task: TaskProps, goTo: boolean) => {
    //     setVisibleExportTasks((prev) => {
    //       const newSet = new Set(prev);
    //       goTo ? newSet.add(task.id) : newSet.delete(task.id);
    //       return newSet;
    //     });
    //     if (task.subtasks && task.subtasks.length >= 0) {
    //       task.subtasks.map((item) => {
    //         recursiveCheck(item, goTo);
    //       });
    //     }
    //   };

    //   return (
    //     <div>
    //       {isTaskSelectionActive ? (
    //         <Checkbox
    //           className="mr-3"
    //           checked={visibleExportTasks.has(task.id)}
    //           onCheckedChange={() => handleChecked(task)}
    //         />
    //       ) : (
    //         <button
    //           type="button"
    //           onClick={() => toggleExpand(item.id)}
    //           className={`w-6 h-6 mr-1 flex items-center justify-center rounded hover:bg-gray-200 ${
    //             hasChildren ? 'visible' : 'invisible'
    //           }`}>
    //           {item.parentTaskId ? (
    //             <ChevronRight
    //               className={`h-4 w-4 transition-transform${isExpanded ? 'transform rotate-90' : ''}`}
    //             />
    //           ) : (
    //             <ChevronsRight
    //               className={`h-4 w-4 transition-transform${isExpanded ? 'transform rotate-90' : ''}`}
    //             />
    //           )}
    //         </button>
    //       )}
    //     </div>
    //   );
    // };

    // const TaskTitle = ({
    //   item,
    // }: {
    //   item: TaskProps;
    // }) => {
    //   return (
    //     <div className="inline-flex w-7/12 items-center">
    //       <Chevron task={item} />

    //       <img
    //         src={getStatusIcon(item.status)}
    //         alt={`${item.status} Icon`}
    //         className="w-6 h-6 mr-2"
    //       />
    //       <div
    //         onClick={() => router.push(`/tasks/${item.id}`)}
    //         onKeyDown={(e) => {
    //           if (e.key === 'Enter' || e.key === ' ') {
    //             e.preventDefault(); // Prevent default scroll behavior for space key
    //             router.push(`/tasks/${item.id}`);
    //           }
    //         }}
    //         className="cursor-pointer w-full">
    //         <span className="flex text-black text-base font-normal font-BaiJamjuree w-11/12">
    //           {item.title}
    //         </span>
    //       </div>
    //     </div>
    //   );
    // };

    // const Money = ({
    //   item,
    // }: {
    //   item: TaskProps;
    // }) => {
    //   //display Money
    //   const displayValue = (type: string, value: number) => {
    //     if (value <= 0) return null;
    //     const color =
    //       type === 'budget'
    //         ? 'text-black'
    //         : type === 'advance'
    //           ? 'text-green'
    //           : type === 'expense'
    //             ? 'text-red'
    //             : null;
    //     const textBaseClass = `font-BaiJamjuree leading-normal ${color}`;
    //     return (
    //       <div className="h-10 px-3 py-2 bg-white rounded-md border border-brown justify-start items-center gap-2 inline-flex">
    //         <div className={`text-2xl font-semibold ${textBaseClass}`}>฿</div>
    //         <div className={`text-base font-medium ${textBaseClass}`}>{value.toLocaleString()}</div>
    //       </div>
    //     );
    //   };
    //   return (
    //     <>
    //       {(item.budget > 0 || item.advance > 0 || item.expense > 0) && (
    //         <div>
    //           {item.budget > 0 && displayValue('budget', item.budget)}
    //           {item.advance > 0 && displayValue('advance', item.advance)}
    //           {item.expense > 0 && displayValue('expense', item.expense)}
    //         </div>
    //       )}
    //     </>
    //   );
    // };

    // const Tag = ({
    //   item,
    // }: {
    //   item: TaskProps;
    // }) => {
    //   return (
    //     <div className="relative flex">
    //       <TooltipProvider>
    //         <Tooltip>
    //           <TooltipTrigger asChild className="cursor-pointer flex max-w-32">
    //             <div>
    //               {item.tags?.length !== 0
    //                 ? item.tags?.slice(0, 3).map((tag, index) => (
    //                     <Badge
    //                       key={tag.id}
    //                       variant="destructive"
    //                       className="h-10 w-28 px-3 py-2 bg-[#eefdf7] rounded-3xl border border-green absolute self-center flex justify-center right-0 transition-transform"
    //                       style={
    //                         {
    //                           transform: `translateX(${index * -28}px)`, // Custom CSS property for group hover
    //                         } as React.CSSProperties
    //                       }>
    //                       <span className="text-green text-base font-semibold font-BaiJamjuree leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
    //                         {tag.name}
    //                       </span>
    //                     </Badge>
    //                   ))
    //                 : null}
    //             </div>
    //           </TooltipTrigger>
    //           <TooltipContent className="flex flex-col gap-1">
    //             {item.tags?.length !== 0
    //               ? item.tags?.map((tag) => (
    //                   <div key={tag.id}>
    //                     <Badge
    //                       variant="destructive"
    //                       className="h-10 px-3 py-2 bg-[#eefdf7] rounded-3xl border border-green ">
    //                       <span className="text-green text-base font-semibold font-BaiJamjuree leading-normal whitespace-nowrap">
    //                         {tag.name}
    //                       </span>
    //                     </Badge>
    //                   </div>
    //                 ))
    //               : null}
    //           </TooltipContent>
    //         </Tooltip>
    //       </TooltipProvider>
    //     </div>
    //   );
    // };

    // const Assigned = ({
    //   item,
    // }: {
    //   item: TaskProps;
    // }) => {
    //   return (
    //     <TooltipProvider>
    //       <Tooltip>
    //         <TooltipTrigger asChild>
    //           <User className="h-8 w-8 p-1 text-brown border border-brown rounded-full hover:cursor-pointer" />
    //         </TooltipTrigger>
    //         <TooltipContent>
    //           {item.members?.length !== 0 ? (
    //             item.members?.map((user) => (
    //               <div key={user.id} className="flex items-center gap-2">
    //                 <span>{user.name}</span>
    //               </div>
    //             ))
    //           ) : (
    //             <span>No one assigned</span>
    //           )}
    //         </TooltipContent>
    //       </Tooltip>
    //     </TooltipProvider>
    //   );
    // };

    // const TaskDate = ({
    //   item,
    // }: {
    //   item: TaskProps;
    // }) => {
    //   //format Date display
    //   const formatDate = (startdate: Date | null, enddate: Date | null): string => {
    //     // Return an empty string if both dates are not provided
    //     if (!startdate || !enddate) return '';

    //     const format = (date: Date): string => {
    //       const day = String(date.getDate()).padStart(2, '0');
    //       const month = String(date.getMonth() + 1).padStart(2, '0');
    //       const year = date.getFullYear();
    //       return `${day}/${month}/${year}`;
    //     };

    //     // Format startdate and enddate if they are valid
    //     const start = startdate ? format(startdate) : '';
    //     const end = enddate ? format(enddate) : '';

    //     return `${start}${start && end ? ' -> ' : ''}${end}`;
    //   };

    //   return (
    //     <>
    //       {item.startDate && item.endDate && (
    //         <div
    //           className="inline-flex gap-1 min-w-60"
    //           title={formatDate(item.startDate, item.endDate)}>
    //           <Calendar className="w-6 h-6 whitespace-nowrap" />
    //           <span>{formatDate(item.startDate, item.endDate)}</span>
    //         </div>
    //       )}
    //     </>
    //   );
    // };
    //for subTask
    