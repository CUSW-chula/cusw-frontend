'use client';

import * as React from 'react';
import { Circle, XCircle, CircleFadingPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import BASE_URL, { BASE_SOCKET, type TaskManageMentProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { Badge } from '@/components/ui/badge';

interface Tags {
  id: string;
  name: string;
}

// Mock data
export function ButtonAddTags({ task_id }: TaskManageMentProp) {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [open, setOpen] = React.useState(false);
  const [statuses, setStatuses] = React.useState<Tags[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<Tags[]>([]);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const pareJsonValue = React.useCallback((values: any) => {
    const newValue: Tags = {
      id: values.id,
      name: values.name,
    };
    return newValue;
  }, []);

  React.useEffect(() => {
    const fetchTags = async () => {
      const url = `${BASE_URL}/tags/`;
      const options = {
        method: 'GET',
        headers: {
          Authorization: auth,
        },
      };

      try {
        const response = await fetch(url, options);
        const data = await response.json();
        setStatuses(data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchSelectedTags = async () => {
      const url = `${BASE_URL}/tags/getassigntag/${task_id}`;
      const options = {
        method: 'GET',
        headers: {
          Authorization: auth,
        },
      };

      try {
        const response = await fetch(url, options);
        const data = await response.json();
        setSelectedTags(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTags();
    fetchSelectedTags();

    const ws = new WebSocket(BASE_SOCKET);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      console.log('Message received:', event.data);

      try {
        const socketEvent = JSON.parse(event.data);
        const eventName = socketEvent.eventName;
        const data = pareJsonValue(socketEvent.data);

        if (eventName === 'assigned-tags') {
          // Update selected tags with new tag added
          setSelectedTags((prev) => [data, ...prev]);
        } else if (eventName === 'unassigned-tag') {
          // Remove tag from selected tags
          setSelectedTags((prev) => prev.filter((t) => t.id !== data.id));
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
    };
  }, [pareJsonValue, task_id, auth]);

  const handleSelectTag = async (value: string) => {
    const selected = statuses.find((status) => status.name === value);
    if (selected && !selectedTags.some((tag) => tag.id === selected.id)) {
      const url = `${BASE_URL}/tags/assign`;
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({ taskId: task_id, tagId: selected.id }),
      };

      try {
        await fetch(url, options);
        // After adding the tag, update the local state
      } catch (error) {
        console.error(error);
      }
    }
    setOpen(false);
  };

  const handleDeleteTag = async (value: string) => {
    const url = `${BASE_URL}/tags/unassigned`;
    const options = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({ taskId: task_id, tagId: value }),
    };

    try {
      await fetch(url, options);
      // Update local state to remove the deleted tag
      setSelectedTags((prev) => prev.filter((tag) => tag.id !== value));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="">
        <div className="flex flex-row flex-wrap items-center   overflow-hidden  ">
          {Array.isArray(selectedTags) && selectedTags.length > 0 ? (
            selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="destructive"
                className="h-7 min-w-fit px-[8px] py-[12px] flex items-center justify-center bg-[#EEFDF7] border-x border-y border-[#69BCA0] text-[#69BCA0]  mr-1 mt-1 mb-1">
                <span className="text-base font-medium font-BaiJamjuree">{tag.name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteTag(tag.id)}
                  className="text-red-500 ml-1 max-w-20">
                  <XCircle className="h-4 w-4" />
                </button>
              </Badge>
            ))
          ) : (
            <div />
          )}

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className=" border-brown text-brown ">
              <Button variant="outline">
                <p className="p-ui">Add Tag</p>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" side="right" align="start">
              <Command>
                <CommandInput placeholder="Add Tag ..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {statuses.map((status) => (
                      <CommandItem key={status.id} value={status.name} onSelect={handleSelectTag}>
                        <Circle
                          className={cn(
                            'mr-2 h-4 w-4 fill-greenLight text-greenLight',
                            Array.isArray(selectedTags) &&
                              selectedTags.some((tag) => tag.id === status.id)
                              ? 'opacity-100'
                              : 'opacity-40',
                          )}
                        />
                        <span>{status.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  );
}
