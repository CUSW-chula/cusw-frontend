'use client';
import { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronRight, CircleUserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import StatusButton from './status-botton';
import { AssignedTaskToMember } from './assigned-task';
import { ButtonAddTags } from './button-add-tag';
import { Money } from './money';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BlockNoteView } from '@blocknote/shadcn';
import { useCreateBlockNote } from '@blocknote/react';
import { type Block, BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import * as Card from '@/components/ui/card';
import * as DropdownMenu from '@/components/ui/dropdown-menu';
import * as Form from '@/components/ui/form';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Popover from '@/components/ui/popover';
import * as Tabs from '@/components/ui/tabs';
import * as Toggle from '@/components/ui/toggle';
import * as Tooltip from '@/components/ui/tooltip';
import { getCookie } from 'cookies-next';
import BASE_URL, { BASE_SOCKET, type TaskManageMentProp } from '@/lib/shared';

interface SubtaskProps {
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
  subtasks?: SubtaskProps[];
}

const unassigned = '/asset/icon/unassigned.svg';
const assigned = '/asset/icon/assigned.svg';
const inrecheck = '/asset/icon/inrecheck.svg';
const underreview = '/asset/icon/underreview.svg';
const done = '/asset/icon/done.svg';

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
              className="h-7 min-w-fit px-2 py-2 flex items-center gap-1 justify-center bg-emerald-300 font-BaiJamjuree text-black ">
              <span className="text-sm">{tag.name}</span>
            </Badge>
          ))
        : null}
    </div>
  );
};

function formatDate(date?: Date | string): string {
  if (!date) return ''; // Return an empty string if no date is provided

  // Ensure the input is a Date object
  const validDate = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(validDate.getTime())) {
    console.error('Invalid date:', date);
    return 'Invalid date';
  }

  const day = String(validDate.getDate()).padStart(2, '0');
  const month = String(validDate.getMonth() + 1).padStart(2, '0');
  const year = validDate.getFullYear();

  return `${day}/${month}/${year}`;
}

function TitleInput({ content, onChange }: { content: string; onChange: (value: string) => void }) {
  const [editedContent, setEditedContent] = useState(content);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = e.target.value;
    setEditedContent(inputText);
    onChange(inputText);
  };

  return (
    <input
      className="resize-none border-none w-full outline-none pl-[54px] placeholder-gray-300 text-[30px] leading-[36px] font-semibold font-Anuphan"
      placeholder="Task Title"
      value={editedContent}
      onChange={handleInputChange}
    />
  );
}

const Subtask = ({ task_id }: TaskManageMentProp) => {
  const [isSubtaskSectionVisible, setIsSubtaskSectionVisible] = useState(false);
  const [isSubtaskVisible, setIsSubtaskVisible] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [subtasks, setSubtasks] = useState<SubtaskProps[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const parseJsonValues = useCallback((values: any[]): SubtaskProps[] => {
    console.log('VALVAL', values);
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

  const SubtaskItem = ({ item, depth = 0 }: { item: SubtaskProps; depth?: number }) => {
    const hasChildren = item.subtasks && item.subtasks.length > 0;
    const isExpanded = expandedItems.has(item.id);

    const displayValue = (type: string, value: number) => {
      if (value <= 0) return null;
      const color =
        type === 'budget' ? 'text-black' : type === 'advance' ? 'text-[#69bca0]' : 'text-[#c30010]';
      return (
        <div className="h-10 px-3 py-2 flex items-center justify-center gap-2">
          <div className={`text-base font-medium font-BaiJamjuree leading-normal ${color}`}>
            ฿ {value.toLocaleString()}
          </div>
        </div>
      );
    };

    const statusSections = [
      { status: 'Unassigned', icon: unassigned },
      { status: 'Assigned', icon: assigned },
      { status: 'InRecheck', icon: inrecheck },
      { status: 'UnderReview', icon: underreview },
      { status: 'Done', icon: done },
    ];

    const getStatusIcon = (status: string) => {
      const section = statusSections.find((section) => section.status === status);
      return section ? section.icon : unassigned; // Fallback icon if status not found
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
          <img src={getStatusIcon(item.status)} alt={`${item.status} Icon`} className="w-5 h-5" />
          <a href={`/tasks/${item.id}`}>
            <span className="text-sm font-BaiJamjuree">{item.title}</span>
          </a>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <GetTagList taskId={item.id} auth={auth} />

            {(item.budget > 0 || item.advance > 0 || item.expense > 0) && (
              <div className="h-10 bg-white rounded-md border border-[#6b5c56] justify-start items-center gap-2 inline-flex">
                {item.budget > 0 && displayValue('budget', item.budget)}
                {item.advance > 0 && displayValue('advance', item.advance)}
                {item.expense > 0 && displayValue('expense', item.expense)}
              </div>
            )}

            {/* Date range display */}
            {item.startDate && item.endDate && (
              <>
                <Calendar className="w-6 h-6" />
                <span>{formatDate(item.startDate)}</span>
              </>
            )}
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

  useEffect(() => {
    const ws = new WebSocket(BASE_SOCKET);

    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/tasks/child/${task_id}`, {
          headers: {
            Authorization: auth,
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const parsedData = parseJsonValues(data);
        setSubtasks(parsedData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchData();

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      console.log('Message received:', event.data);

      try {
        const socketEvent = JSON.parse(event.data);
        const eventName = socketEvent.eventName;
        const data = parseJsonValues(socketEvent.data);
        if (eventName === 'taskid edited') {
          console.log('SOCKET', data);
          setSubtasks((prevList) => [...prevList, ...data]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null;
    };
  }, [auth, parseJsonValues, task_id]);

  const handleToggleSubtaskSection = () => {
    setIsSubtaskSectionVisible(!isSubtaskSectionVisible);
  };

  const handleToggleSubtask = () => {
    setIsSubtaskVisible(!isSubtaskVisible);
  };

  const { audio, image, video, file, ...allowedBlockSpecs } = defaultBlockSpecs;

  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...allowedBlockSpecs,
    },
  });

  const editor = useCreateBlockNote({
    schema,
    initialContent: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '',
            styles: {},
          },
        ],
      },
    ],
  });

  const handleCreateSubtask = async () => {
    try {
      const response = await fetch(`${BASE_URL}/tasks/`, {
        method: 'POST',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '',
          description: '',
          expectedBudget: 0,
          realBudget: 0,
          usedBudget: 0,
          status: 'Unassigned',
          parentTaskId: task_id,
          projectId: 'cm24w5yu000008tlglutu5czu',
          startDate: new Date(),
          endDate: new Date(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subtask');
      }

      const data = await response.json();

      // Update subtasks with the new subtask added to the existing list
      console.log('New subtask created:', data);

      setSubtasks((prevSubtasks) => [...prevSubtasks, data]);
    } catch (error) {
      console.error('Error creating subtask:', error);
    }
  };

  const handleDeleteSubtask = async () => {
    try {
      const latestSubtask = subtasks[subtasks.length - 1];
      const response = await fetch(`${BASE_URL}/tasks/${latestSubtask.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: auth,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete subtask');
      }

      // Update the subtasks array by removing the deleted subtask
      setSubtasks((prevSubtasks) => prevSubtasks.filter((task) => task.id !== latestSubtask.id));
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const handleSubmitSubtask = async () => {
    const descriptionText = editor.document
      .map((block) =>
        Array.isArray(block.content) && block.content[0] && 'text' in block.content[0]
          ? (block.content[0] as { text: string }).text
          : '',
      )
      .join(' ');

    try {
      const latestSubtask = subtasks[subtasks.length - 1]; // Get the latest created subtask
      const response = await fetch(`${BASE_URL}/tasks/`, {
        method: 'PATCH',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: latestSubtask.id,
          title: subtaskTitle,
          description: descriptionText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subtask');
      }

      const data = await response.json();
      console.log('Subtask updated:', data);

      // Update the subtasks array with the new data
      setSubtasks((prevSubtasks) =>
        prevSubtasks.map((task) =>
          task.id === latestSubtask.id
            ? { ...task, title: subtaskTitle, description: descriptionText }
            : task,
        ),
      );

      // Clear the input fields after successful update
      setSubtaskTitle('');
      setIsSubtaskSectionVisible(false);
    } catch (error) {
      console.error('Error updating subtask:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center py-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSubtask}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200">
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform',
                isSubtaskVisible && 'transform rotate-90',
              )}
            />
          </button>
          <span className="text-gray-700 font-medium">Subtask</span>
        </div>
        <div className="flex-grow" />
        <div className="relative">
          <Select>
            <SelectTrigger className="w-[200px] border-[#6b5c56]">
              <SelectValue
                className="font-BaiJamjuree text-[#6b5c56]"
                placeholder="Sort By: Start Date"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Start Date">Sort By: Start Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          className="ml-3 flex items-center text-[#6b5c56] border-[#6b5c56] px-3 py-1 rounded-md"
          onClick={() => {
            setIsSubtaskSectionVisible(!isSubtaskSectionVisible);
            handleCreateSubtask();
          }}>
          + Add Subtask
        </Button>
      </div>

      {/* Subtask creation section */}
      {isSubtaskSectionVisible && (
        <div className="h-[232px] w-full p-6 bg-gray-50 rounded-md shadow border border-[#6b5c56] flex-col justify-start items-start gap-4 inline-flex">
          <div className="">
            <TitleInput content={''} onChange={setSubtaskTitle} />
            <BlockNoteView
              editor={editor}
              theme={'light'}
              onChange={() => {
                setBlocks(editor.document);
              }}
              shadCNComponents={{
                Card,
                DropdownMenu,
                Form,
                Input,
                Label,
                Popover,
                Tabs,
                Toggle,
                Tooltip,
              }}
            />
          </div>
          <div className="self-stretch h-[92px] flex-col justify-start items-start gap-3 flex">
            <div className="justify-start items-center gap-2 inline-flex">
              {subtasks.length > 0 && (
                <>
                  {/* <StatusButton task_id={subtasks[subtasks.length - 1].id} />
                  <AssignedTaskToMember task_id={subtasks[subtasks.length - 1].id} /> */}
                  <ButtonAddTags task_id={subtasks[subtasks.length - 1].id} />
                </>
              )}
            </div>
            <div className="self-stretch justify-end items-center gap-3 inline-flex">
              <Button
                variant="outline"
                className="text-base font-BaiJamjuree font-medium leading-normal border-[#6b5c56]"
                onClick={() => {
                  handleToggleSubtaskSection();
                  handleDeleteSubtask();
                }}>
                Cancel
              </Button>
              <Button
                variant="outline"
                type="submit"
                className="bg-[#6b5c56] text-base font-BaiJamjuree font-medium text-white leading-normal"
                onClick={handleSubmitSubtask}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
      {isSubtaskVisible && (
        <div className="w-full space-y-1">
          {subtasks.map((item) => (
            <SubtaskItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Subtask;
