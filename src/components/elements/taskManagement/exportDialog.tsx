import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { TaskProps } from '@/app/types/types';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { statusSections, parseJsonValuesTemplate, useExportTask } from '@/lib/taskUtils';

export const ExportDialog = ({ tasks }: { tasks: TaskProps[] }) => {
  const [exportType, setExportType] = useState<string>(''); // the type of export
  const [visibleExportTasks, setVisibleExportTasks] = useState<Set<string>>(new Set()); //Tracks taskID visible for export
  const [exportedTasks, setExportedTasks] = useState<TaskProps[]>([]); //Stores the list of tasks selected for export
  const { exportAsFile, exportAsTemplate } = useExportTask();
  const recursiveCheck = (task: TaskProps) => {
    setVisibleExportTasks((prev) => {
      const newSet = new Set(prev);
      newSet.add(task.id);
      return newSet;
    });
    if (task.subtasks && task.subtasks.length >= 0) {
      task.subtasks.map((item) => {
        recursiveCheck(item);
      });
    }
  };
  const handleSaveAs = (value: string) => {
    if (value === 'saveFile') {
      exportAsFile(exportedTasks);
    } else if (value === 'saveTemplate') {
      exportAsTemplate(parseJsonValuesTemplate(tasks), visibleExportTasks);
    }
    setExportType('');
    setExportedTasks([]);
    setVisibleExportTasks(() => new Set<string>());
  };

  const SelectType = () => {
    const handleSelectTasks = (value: string) => {
      setVisibleExportTasks(new Set<string>());
      setExportedTasks([]);
      setExportType(value);
    };
    return (
      <div>
        <Select
          onValueChange={(value) => {
            handleSelectTasks(value);
          }}
          value={exportType}>
          <SelectTrigger className="w-36 border-brown focus:ring-transparent">
            <SelectValue className="text-brown" placeholder="Select export type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem key="saveFile" value="saveFile">
                .CSV
              </SelectItem>
              <SelectItem key="saveTemplate" value="saveTemplate">
                Template
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
  };
  const Task = ({
    item: task,
    depth = 0,
  }: {
    item: TaskProps;
    depth?: number;
  }) => {
    const getStatusIcon = (status: string) => {
      const section = statusSections.find((section) => section.status === status);
      return section ? section.icon : '/asset/icon/unassigned.svg'; // Fallback icon if status not found
    };
    const handleChecked = async (task: TaskProps) => {
      if (!visibleExportTasks.has(task.id)) {
        const newSet = [...exportedTasks, task];
        setExportedTasks(newSet);
        recursiveCheck(task);
      } else {
        const newSet = exportedTasks.filter((item) => item !== task);
        setExportedTasks(newSet);
        setVisibleExportTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(task.id);
          return newSet;
        });
      }
    };
    return (
      <>
        <div className="flex items-center hover:bg-gray-50">
          <Checkbox
            className={`mr-3 
                 ${
                   exportType === 'saveTemplate'
                     ? 'visible'
                     : exportType === 'saveFile' && !task.parentTaskId
                       ? 'visible'
                       : 'invisible'
                 }
              `}
            checked={visibleExportTasks.has(task.id)}
            onCheckedChange={() => handleChecked(task)}
          />
          <div
            className="flex items-center w-full h-fit my-1.5"
            style={{ marginLeft: `${depth * 24 + 24}px` }}>
            <img
              src={getStatusIcon(task.status)}
              alt={`${task.status} Icon`}
              className="w-6 h-6 mr-2"
            />
            <p>{task.title}</p>
          </div>
        </div>

        {task.subtasks && task.subtasks.length > 0 && (
          <div>
            {task.subtasks?.map((child) => (
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
    <Dialog>
      <DialogTrigger className="border p-2 text-sm rounded-md border-brown h-10">
        Export tasks
      </DialogTrigger>
      <DialogContent className="w-max max-w-3xl gap-3">
        <DialogTitle>Export tasks</DialogTitle>
        <DialogDescription> กรุณาเลือกรูปแบบการส่งออกเอกสาร</DialogDescription>
        <div className="flex-col w-[640px] h-full ">
          <nav className="inline-flex gap-2 mb-3 justify-between w-full">
            <SelectType />
            {exportType !== '' && (
              <div className="gap-2 inline-flex">
                <Button
                  onClick={() => handleSaveAs(exportType)}
                  className="text-green font-bold border-green px-3 py-1 rounded-md bg-[#eefdf7] border hover:bg-slate-100 w-20">
                  Save
                </Button>
                <Button
                  onClick={() => handleSaveAs('cancel')}
                  className="text-red font-bold border-red px-3 py-1 rounded-md bg-[#fde8e8] border hover:bg-slate-100 w-20">
                  Cancel
                </Button>
              </div>
            )}
          </nav>
          <div className="w-full max-h-[540px] overflow-y-scroll">
            {statusSections.map(({ status, displayName, icon }) => (
              <div key={status}>
                {/* Status Title */}
                <div className="flex items-center gap-2 border-b border-gray-300 py-3">
                  <img src={icon} alt={`${status} Icon`} className="w-6 h-6" />
                  <span className="text-black text-sm font-medium font-BaiJamjuree">
                    {displayName}
                  </span>
                </div>
                {/* Tasks in there group */}
                <div className="w-full block">
                  {tasks
                    .filter((item) => item.status === status) // Match with the status property
                    .map((item) => (
                      <Task key={item.id} item={item} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
