'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCallback, useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import BASE_URL, { BASE_SOCKET, Task, type Status, type TaskManageMentProp } from '@/lib/shared';
import React from 'react';
import { getCookie } from 'cookies-next';
import { statusSections } from '@/lib/taskUtils';
import type { TaskProps } from '@/app/types/types';
import { useToast } from '@/hooks/use-toast';

const statuses: Status[] = statusSections;
const unassignStatus: Status = {
  status: 'Unassigned',
  displayName: 'Unassigned',
  icon: '/asset/icon/unassigned.svg',
};

export function StatusButton({ task }: { task: TaskProps }) {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status>(unassignStatus);
  const [isAllSubTaskDone, setIsAllSubTaskDone] = useState(true);

  const getStatus = (value: string) => {
    const status = statusSections.find((section) => section.status === value);
    return status
      ? status
      : { status: 'Unassigned', displayName: 'Unassigned', icon: '/asset/icon/unassigned.svg' }; // Fallback icon if status not found
  };

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const parseJsonValue = useCallback((values: any) => {
    const newValue = statuses.find((s) => s.status === values.status);
    return newValue
      ? newValue
      : { status: 'Unassigned', displayName: 'Unassigned', icon: '/asset/icon/unassigned.svg' };
  }, []);

  useEffect(() => {
    setSelectedStatus(getStatus(task.status));
    task.subtasks
      ? setIsAllSubTaskDone(task.subtasks.every((subtask) => subtask.status === 'Done'))
      : setIsAllSubTaskDone(true);

    const ws = new WebSocket(BASE_SOCKET);

    ws.onopen = () => console.log('Connected to WebSocket');

    ws.onmessage = (event) => {
      console.log('Message received:', event.data);

      try {
        const socketEvent = JSON.parse(event.data);
        const eventName = socketEvent.eventName;
        const data = parseJsonValue(socketEvent.data);

        if (eventName === 'status-changed') {
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
  }, [parseJsonValue, task]);

  const handleSelectStatus = async (status: Status) => {
    setSelectedStatus(getStatus(task.status));
    setOpen(false);
    const url = `${BASE_URL}/v2/tasks/status`;
    const options = {
      method: 'PATCH',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: task.id,
        newTaskStatus: status.status,
      }),
    };

    try {
      const response = await fetch(url, options);

      if (response.ok) {
        toast({
          title: 'success',
          description: `You changed the status to "${selectedStatus.displayName}"`,
          variant: 'default', // หรือใช้ 'success' ถ้ามี custom variant
        });
      }
      const data = await response.json();
    } catch (error) {
      console.error(error);
    }
  };

  const { toast } = useToast();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className=" border-brown text-brown">
        <Button
          variant="outline"
          size="sm"
          disabled={selectedStatus.status === 'Unassigned'}
          className="h-[40px] px-[16px] justify-start font-BaiJamjuree text-base">
          {selectedStatus ? (
            <>
              <div className="flex items-center gap-[8px]">
                <img
                  src={selectedStatus.icon}
                  alt={`${selectedStatus.status} Icon`}
                  className="h-6 w-6 shrink-0"
                />
                {selectedStatus.displayName}
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
                  key={status.status}
                  value={status.status}
                  disabled={
                    (selectedStatus.status === 'Assigned' && status.status !== 'UnderReview') ||
                    (selectedStatus.status === 'UnderReview' &&
                      (status.status === 'Unassigned' ||
                        status.status === 'Assigned' ||
                        status.status === 'UnderReview' ||
                        (status.status === 'Done' && !isAllSubTaskDone))) ||
                    (selectedStatus.status === 'InRecheck' && status.status !== 'UnderReview') ||
                    (selectedStatus.status === 'Done' && status.status !== 'InRecheck')
                  }
                  className="pl-[32px] font-BaiJamjuree text-base"
                  onSelect={() => {
                    handleSelectStatus(status);
                  }}>
                  <img
                    src={status.icon}
                    className="mr-2 h-4 w-4 shrink-0"
                    alt={status.displayName}
                  />
                  <span>{status.displayName}</span>
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
