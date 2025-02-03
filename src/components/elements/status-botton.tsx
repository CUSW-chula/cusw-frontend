'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCallback, useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { selectedStatusAtom } from '@/atom';
import BASE_URL, { BASE_SOCKET, type Status, type TaskManageMentProp } from '@/lib/shared';
import React from 'react';
import { getCookie } from 'cookies-next';

const Unassigned = '/asset/icon/unassigned.svg';
const Assigned = '/asset/icon/assigned.svg';
const UnderReview = '/asset/icon/underreview.svg';
const InRecheck = '/asset/icon/inrecheck.svg';
const Done = '/asset/icon/done.svg';

const statuses: Status[] = [
  {
    value: 'Unassigned',
    label: 'Unassigned',
    icon: Unassigned,
  },
  {
    value: 'Assigned',
    label: 'Assigned',
    icon: Assigned,
  },
  {
    value: 'UnderReview',
    label: 'UnderReview',
    icon: UnderReview,
  },
  {
    value: 'InRecheck',
    label: 'InRecheck',
    icon: InRecheck,
  },
  {
    value: 'Done',
    label: 'Done',
    icon: Done,
  },
];

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

export function StatusButton({ task_id }: TaskManageMentProp) {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useAtom<Status>(selectedStatusAtom);
  const [isAllSubTaskDone, setIsAllSubTaskDone] = useState(true);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const parseJsonValue = useCallback((values: any) => {
    const newValue: Status = {
      value: values.status,
      label: values.status,
      icon: `/asset/icon/${values.status.toLowerCase()}.svg`,
    };
    return newValue;
  }, []);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const parseJsonValues = useCallback((values: any[]): SubtaskProps[] => {
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
    const fetchStatus = async (taskId: string) => {
      const url = `${BASE_URL}/v2/tasks/${taskId}`;
      const options = { method: 'GET', headers: { Authorization: auth } };

      try {
        const response = await fetch(url, options);
        const data = await response.json();
        const selected = statuses.find((s) => s.value === data.status);
        if (selected) setSelectedStatus(selected);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStatus(task_id);

    const fetchSubStatus = async (taskID: string) => {
      const url = `${BASE_URL}/v2/tasks/child/${taskID}`;
      const options = { method: 'GET', headers: { Authorization: auth } };

      try {
        const response = await fetch(url, options);
        const data = await response.json();
        const subTasks = parseJsonValues(data);
        setIsAllSubTaskDone(subTasks.every((subtask) => subtask.status === 'Done'));
      } catch (error) {
        console.error(error);
      }
    };

    fetchSubStatus(task_id);

    const ws = new WebSocket(BASE_SOCKET);

    ws.onopen = () => console.log('Connected to WebSocket');

    ws.onmessage = (event) => {
      console.log('Message received:', event.data);

      try {
        const socketEvent = JSON.parse(event.data);
        const eventName = socketEvent.eventName;
        const data = parseJsonValue(socketEvent.data);

        if (eventName === 'status-changed') {
          console.log('status-change ->', data);
          setSelectedStatus(data);
        }
      } catch (error) {
        console.error('error parsing websocket message: ', error);
      }
    };

    ws.onclose = () => {
      console.log('websocket connection closed');
    };

    return () => ws.close();
  }, [setSelectedStatus, auth, parseJsonValue, task_id]);

  const handleSelectStatus = async (status: Status) => {
    setSelectedStatus(status);
    setOpen(false);
    const url = `${BASE_URL}/v2/tasks/status`;
    const options = {
      method: 'PATCH',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: task_id,
        newTaskStatus: status.value,
      }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className=" border-brown text-brown">
        <Button
          variant="outline"
          size="sm"
          disabled={selectedStatus.value === 'Unassigned'}
          className="h-[40px] px-[16px] justify-start font-BaiJamjuree text-base">
          {selectedStatus ? (
            <>
              <div className="flex items-center gap-[8px]">
                <img
                  src={selectedStatus.icon}
                  className="h-6 w-6 shrink-0"
                  alt={selectedStatus.label}
                />
                {selectedStatus.label}
              </div>
            </>
          ) : (
            <>status</>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[268px]" side="right" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {statuses.map((status) => (
                <CommandItem
                  key={status.value}
                  value={status.value}
                  disabled={
                    (selectedStatus.value === 'Assigned' && status.value !== 'UnderReview') ||
                    (selectedStatus.value === 'UnderReview' &&
                      (status.value === 'Unassigned' ||
                        status.value === 'Assigned' ||
                        status.value === 'UnderReview' ||
                        (status.value === 'Done' && !isAllSubTaskDone))) ||
                    (selectedStatus.value === 'InRecheck' && status.value !== 'UnderReview') ||
                    (selectedStatus.value === 'Done' && status.value !== 'InRecheck')
                  }
                  className="pl-[32px] font-BaiJamjuree text-base"
                  onSelect={() => {
                    handleSelectStatus(status);
                  }}>
                  <img src={status.icon} className="mr-2 h-4 w-4 shrink-0" alt={status.label} />
                  <span>{status.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default StatusButton;
