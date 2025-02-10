'use client';
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusButton from './status-botton';
import { AssignedTaskToMember } from './assigned-task';
import { ButtonAddTags } from './button-add-tag';
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
import BASE_URL, { BASE_SOCKET } from '@/lib/shared';
import { Task } from './taskManagement';
import type { TaskProps } from '@/app/types/types';

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

const Subtask = ({ task }: { task: TaskProps }) => {
  const [isSubtaskSectionVisible, setIsSubtaskSectionVisible] = useState(false);
  const [isSubtaskVisible, setIsSubtaskVisible] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [subtasks, setSubtasks] = useState<TaskProps[]>([]);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  useEffect(() => {
    try {
      setSubtasks(task.subtasks ?? []);
      console.log(task.subtasks);
      task.subtasks?.map((item) => {
        console.log(item.endDate);
      });
    } catch (error) {
      console.log('Error');
    }
  }, []);

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
      const response = await fetch(`${BASE_URL}/v2/tasks/`, {
        method: 'POST',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '',
          description: '',
          budget: 0,
          advance: 0,
          expense: 0,
          status: 'Unassigned',
          parentTaskId: task.id,
          projectId: task.projectId,
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
      const response = await fetch(`${BASE_URL}/v1/tasks/${latestSubtask.id}`, {
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
      const response = await fetch(`${BASE_URL}/v1/tasks/`, {
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
              {subtasks && subtasks.length > 0 && (
                <>
                  <StatusButton task={subtasks[subtasks.length - 1]} />
                  <AssignedTaskToMember task={subtasks[subtasks.length - 1]} />
                  <ButtonAddTags task={subtasks[subtasks.length - 1]} />
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
            <Task item={item} key={item.id} hiddenDate={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Subtask;
