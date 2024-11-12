'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { selectedStatusAtom } from '@/atom';
import type { Status } from '@/lib/shared';
import React from 'react';

const Unassigned = '/asset/icon/unassigned.svg';
const Assigned = '/asset/icon/assigned.svg';
const UnderReview = '/asset/icon/inreview.svg';
const InRecheck = '/asset/icon/inrecheck.svg';
const Done = '/asset/icon/done.svg';

const statuses: Status[] = [
  {
    value: 'Unassigned',
    label: 'unassigned',
    icon: Unassigned,
  },
  {
    value: 'Assigned',
    label: 'assigned',
    icon: Assigned,
  },
  {
    value: 'UnderReview',
    label: 'under review',
    icon: UnderReview,
  },
  {
    value: 'InRecheck',
    label: 'in recheck',
    icon: InRecheck,
  },
  {
    value: 'Done',
    label: 'done',
    icon: Done,
  },
];

export function StatusButton() {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useAtom<Status>(selectedStatusAtom);

  const parseJsonValue = React.useCallback((values: Status) => {
    const newValue: Status = {
      value: values.value,
      label: values.label,
      icon: values.icon,
    };
    return newValue;
  }, []);

  useEffect(() => {
    const fetchStatus = async (taskId: string) => {
      const url = `http://localhost:4000/api/tasks/status/${taskId}`;
      const options = { method: 'GET' };

      try {
        const response = await fetch(url, options);
        const data = await response.json();
        const selected = statuses.find((s) => s.value === data);
        if (selected) setSelectedStatus(selected);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStatus('cm24lq0sx0001jkpdbc9lxu8x');

    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => console.log('Connected to WebSocket');

    ws.onmessage = (event) => {
      console.log('Message received:', event.data);

      try {
        const socketEvent = JSON.parse(event.data);
        const eventName = socketEvent.eventName;

        if (eventName === 'status-changed') {
          fetchStatus('cm24lq0sx0001jkpdbc9lxu8x');
        }
      } catch (error) {
        console.error('error parsing websocket message: ', error);
      }
    };

    ws.onclose = () => {
      console.log('websocket connection closed');
    };

    return () => ws.close();
  }, [setSelectedStatus]);

  const handleSelectStatus = async (status: Status) => {
    setSelectedStatus(status);
    setOpen(false);
    const url = 'http://localhost:4000/api/tasks/changedStatus';
    const options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: 'cm24lq0sx0001jkpdbc9lxu8x',
        newTaskStatus: status.value,
      }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
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
