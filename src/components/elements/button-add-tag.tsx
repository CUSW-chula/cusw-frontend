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

interface Tags {
  id: string;
  name: string;
}

// Mock data
export function ButtonAddTags() {
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
      const url = 'http://localhost:4000/api/tags/';
      const options = { method: 'GET' };

      try {
        const response = await fetch(url, options);
        const data = await response.json();
        setStatuses(data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchSelectedTags = async () => {
      const url = 'http://localhost:4000/api/tags/getassigntag/cm24lq0sx0001jkpdbc9lxu8x';
      const options = { method: 'GET' };

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

    const ws = new WebSocket('ws://localhost:3001');

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
          setSelectedTags((prev) => [...prev, data]);
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
  }, [pareJsonValue]);

  const handleSelectTag = async (value: string) => {
    const selected = statuses.find((status) => status.name === value);
    if (selected && !selectedTags.some(tag => tag.id === selected.id)) {
      const url = 'http://localhost:4000/api/tags/assign';
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: 'cm24lq0sx0001jkpdbc9lxu8x', tagId: selected.id }),
      };

      try {
        await fetch(url, options);
        // After adding the tag, update the local state
        setSelectedTags((prev) => [...prev, selected]); // Immediately update state
      } catch (error) {
        console.error(error);
      }
    }
    setOpen(false);
  };

  const handleDeleteTag = async (value: string) => {
    const url = 'http://localhost:4000/api/tags/unassigned';
    const options = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: 'cm24lq0sx0001jkpdbc9lxu8x', tagId: value }),
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
      <div className="flex flex-row gap-1 flex-wrap">
        {selectedTags.map((tag) => (
          <Button variant="outline" key={tag.id}>
            <Circle className="mr-1 h-4 w-4 fill-greenLight text-greenLight font-BaiJamjuree" />
            <span>{tag.name}</span>
            <button
              type="button"
              onClick={() => handleDeleteTag(tag.id)}
              className="text-red-500 ml-1">
              <XCircle className="h-4 w-4" />
            </button>
          </Button>
        ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CircleFadingPlus className="mr-2 h-4 w-4" /> <p className="p-ui">Add Tag</p>
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
    </>
  );
}
