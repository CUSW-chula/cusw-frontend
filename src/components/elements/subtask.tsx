'use client';
import { useState, useEffect, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
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
  subtasks?: SubtaskProps[];
}

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
            <span className="text-sm text-gray-500">
              {item.startDate ? formatDate(item.startDate) : ''}
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
        if (eventName === 'task') {
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
  }, [auth, parseJsonValues]);

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
          expectedBudget: 1,
          realBudget: 1,
          usedBudget: 1,
          status: 'Unassigned',
          parentTaskId: task_id,
          projectId: 'cm3cizozb00014lduhxi8q8lt',
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
          task.id === latestSubtask.id ? { ...task, title: subtaskTitle, description: descriptionText } : task
        )
      );
  
      // Clear the input fields after successful update
      setSubtaskTitle('');
      ;
      setIsSubtaskSectionVisible(false);
    } catch (error) {
      console.error('Error updating subtask:', error);
    }
  };
  

  return (
    <div>
      <div className="flex items-center border-l-4 border-blue-200 pl-2 py-1">
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
              <StatusButton />
              {subtasks.length > 0 && (
                <>
                  <AssignedTaskToMember task_id={subtasks[subtasks.length - 1].id} />
                  <ButtonAddTags task_id={subtasks[subtasks.length - 1].id} />
                </>
              )}
            </div>
            <div className="self-stretch justify-end items-center gap-3 inline-flex">
              <Button
                variant="outline"
                className="text-base font-BaiJamjuree font-medium leading-normal border-[#6b5c56]"
                onClick={handleToggleSubtaskSection}>
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
