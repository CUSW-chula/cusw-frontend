'use client';
import { useCallback, useEffect, useState, createContext } from 'react';
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
import { exportAsFile, exportAsTemplate } from '@/lib/taskUtils';

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
  const [isSelectTaskClicked, setIsSelectTaskClicked] = useState<boolean>(false); // the status "Select Task" button has been pressed or not
  const [exportType, setExportType] = useState<string>(''); // the type of export
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

        if (tag.id === 'all') {
          setShowTasks(tasks);
          return;
        }
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
      const handleSelectTasks = (value: string) => {
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
        setIsSelectTaskClicked(!isSelectTaskClicked);
        setExportType(value);
        if (!isSelectTaskClicked) expandItemsRecursively(showTasks);
      };

      const handleSaveAs = (value: string) => {
        if (value === 'saveFile') {
          exportAsFile(exportedTasks);
        } else if (value === 'saveTemplate') {
          exportAsTemplate(exportedTasks, visibleExportTasks);
        }
        setIsSelectTaskClicked(!isSelectTaskClicked);
        setExportedTasks([]);
        setVisibleExportTasks(new Set());
      };

      return (
        <div>
          {!isSelectTaskClicked && (
            <div>
              <Select onValueChange={(value) => handleSelectTasks(value)}>
                <SelectTrigger className="w-36 border-brown">
                  <SelectValue className="text-brown" placeholder="Select export type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="saveFile" value="saveFile">
                    .CSV
                  </SelectItem>
                  <SelectItem key="saveTemplate" value="saveTemplate">
                    Template
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {isSelectTaskClicked && (
            <div>
              <Button
                onClick={() => handleSaveAs(exportType)}
                className="text-brown border-brown px-3 py-1 rounded-md bg-white border hover:bg-slate-100">
                Save
              </Button>
              <Button
                onClick={() => handleSaveAs('cancel')}
                className="text-brown border-brown px-3 py-1 rounded-md bg-white border hover:bg-slate-100">
                Cancel
              </Button>
            </div>
          )}
        </div>
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
            usedBudget: 0,
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
              isSelectTaskClicked={isSelectTaskClicked}
              visibleExportTasks={visibleExportTasks}
              setVisibleExportTasks={setVisibleExportTasks}
              exportedTasks={exportedTasks}
              setExportedTasks={setExportedTasks}
              exportType={exportType}
              setExportType={setExportType}
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
                <Task key={item.id} item={item} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
