'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCallback, useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { selectedStatusAtom } from '@/atom';
import BASE_URL, {
  BASE_SOCKET,
  Task,
  type User,
  type Status,
  type TaskManageMentProp,
} from '@/lib/shared';
import React from 'react';
import { getCookie } from 'cookies-next';
import { statusSections } from '@/lib/taskUtils';
import type { TaskProps } from '@/app/types/types';
import { useToast } from '@/hooks/use-toast';
import { jwtDecode } from 'jwt-decode';

const statuses: Status[] = statusSections;

export function StatusButton({ task }: { task: TaskProps }) {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const decoded = jwtDecode<{ id: string }>(auth);
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useAtom<Status>(selectedStatusAtom);
  const [isAllSubTaskDone, setIsAllSubTaskDone] = useState(true);
  const [projectOwner, setProjectOwner] = useState<User[]>([]);
  const [isBypassAble, setIsBypassAble] = useState(false);

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
    const fetchProjectOwner = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/projects/${task.projectId}`, {
          headers: { Authorization: auth },
        });
        if (!response.ok) {
          const errorMessage = await response.text();

          return;
        }
        const data = await response.json();
        setProjectOwner(data.owner);

        if (!auth) return;

        try {
          const decoded = jwtDecode<{ id: string }>(auth);
          const isOwner = data.owner.some((o: User) => o.id === decoded.id);
          setIsBypassAble(isOwner);
        } catch (error) {
          console.error('Invalid token:', error);
        }
      } catch (error) {
        console.error('Error fetching Owner:', error);
      }
    };
    const fetchBypassAble = async () => {
      try {
        const responseUser = await fetch(`${BASE_URL}/v2/users/${decoded.id}`, {
          headers: { Authorization: auth },
        });

        const userData = await responseUser.json();

        if (userData.admin || userData.head) {
          setIsBypassAble(true);

          return;
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
      if (!isBypassAble) fetchProjectOwner();
    };

    fetchBypassAble();

    setSelectedStatus(getStatus(task.status));
    setIsAllSubTaskDone(task.subtasks?.every((subtask) => subtask.status === 'Done') ?? true);

    const ws = new WebSocket(BASE_SOCKET);

    ws.onopen = () => {};

    ws.onmessage = (event) => {
      try {
        const socketEvent = JSON.parse(event.data);
        const eventName = socketEvent.eventName;
        const data = parseJsonValue(socketEvent.data);

        if (eventName === `status-changed:${task.id}`) {
          setSelectedStatus(data);
          toast({
            title: 'Status Changed',
            description: `The status has been changed to "${data.status}"`,
            variant: 'default',
          });
        }
      } catch (error) {
        console.error('error parsing websocket message: ', error);
      }
    };

    ws.onclose = () => {};

    return () => ws.close();
  }, [setSelectedStatus, parseJsonValue, task, auth]);

  const handleSelectStatus = async (status: Status) => {
    setSelectedStatus(getStatus(task.status));
    setOpen(false);
    const url = `${BASE_URL}/v2/tasks/status/${task.id}`;
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
          title: 'Complete',
          description: `You changed this task status to "${status.status}"`,
          variant: 'default', // หรือใช้ 'success' ถ้ามี custom variant
        });
      } else {
        const errorMessage = await response.text();
      }
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
          disabled={!isBypassAble && selectedStatus.status === 'Unassigned'}
          className="h-8 px-2 justify-start font-BaiJamjuree text-sm">
          {selectedStatus ? (
            <>
              <div className="flex items-center gap-[8px]">
                <img
                  src={selectedStatus.icon}
                  alt={`${selectedStatus.status} Icon`}
                  className="max-w-5 shrink-0"
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
                    !isBypassAble &&
                    ((selectedStatus.status === 'Assigned' && status.status !== 'UnderReview') ||
                      (selectedStatus.status === 'UnderReview' &&
                        (status.status === 'Unassigned' ||
                          status.status === 'Assigned' ||
                          status.status === 'UnderReview' ||
                          (status.status === 'Done' && !isAllSubTaskDone))) ||
                      (selectedStatus.status === 'InRecheck' && status.status !== 'UnderReview') ||
                      (selectedStatus.status === 'Done' && status.status !== 'InRecheck'))
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
