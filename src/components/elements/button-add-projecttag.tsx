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
import BASE_URL, { BASE_SOCKET, type Tag, type ProjectOverviewProps } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';

interface Tags {
  id: string;
  name: string;
}

// Mock data
export function ButtonAddTags({ project_id }: ProjectOverviewProps) {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const userid = (jwtDecode(auth) as { id: string }).id;
  const [isHead, setIsHead] = React.useState<boolean>();
  const [open, setOpen] = React.useState(false);
  const [statuses, setStatuses] = React.useState<Tags[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<Tags[]>([]);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const pareJsonValue = React.useCallback((values: any) => {
    const newValue: Tags[] = values.tags;
    return newValue;
  }, []);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/users/${userid}`, {
          headers: {
            Authorization: auth,
          },
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          toast({
            title: `🚨 Error ${response.status}: ${response.statusText}`,
            description: `🔥 error: ${errorMessage || 'An unexpected error occurred.'}🗂️ file: nav-bar.tsx`,
            variant: 'default',
          });
        }

        const data = await response.json();
        setIsHead(data.admin);
      } catch (error) {
        console.error('Error fetching Owner:', error);
      }
    };

    fetchOwner();
  }, [auth, userid]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const fetchTags = async () => {
      const url = `${BASE_URL}/v2/tags`;
      const options = {
        method: 'GET',
        headers: {
          Authorization: auth,
        },
      };

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          const errorMessage = await response.text();
          toast({
            title: `🚨 Error ${response.status}: ${response.statusText}`,
            description: `
                  🔥 error: ${errorMessage || 'An unexpected error occurred.'}
                  
                  🗂️ file: button-add-projecttag.tsx
                      `,
            variant: 'default',
          });
        }
        const data: Tag[] = await response.json();
        setStatuses(data.filter((tag) => tag.isProject));
      } catch (error) {
        console.error(error);
      }
    };

    const fetchSelectedTags = async () => {
      const url = `${BASE_URL}/v2/projects/${project_id}`;
      const options = {
        method: 'GET',
        headers: {
          Authorization: auth,
        },
      };

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          const errorMessage = await response.text();
          // throw new Error("Failed to assign tag");
          toast({
            title: `🚨 Error ${response.status}: ${response.statusText}`,
            description: `
        🔥 error: ${errorMessage || 'An unexpected error occurred.'}
        
        🗂️ file: button-add-projecttag.tsx
            `,
            variant: 'default',
          });
        }
        const data = await response.json();
        setSelectedTags(data.tags);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTags();
    fetchSelectedTags();

    const ws = new WebSocket(BASE_SOCKET);

    ws.onopen = () => {};

    ws.onmessage = (event) => {
      try {
        const socketEvent = JSON.parse(event.data);
        const eventName = socketEvent.eventName;
        const data = pareJsonValue(socketEvent.data);

        if (eventName === `assigned-tags-project:${project_id}`) {
          // Update selected tags with new tag added
          setSelectedTags(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {};

    return () => {
      ws.close();
    };
  }, [auth, project_id, pareJsonValue, setSelectedTags]);

  const handleSelectTag = async (value: string) => {
    const selected = statuses.find((status) => status.name === value);
    if (selected && !selectedTags.some((tag) => tag.id === selected.id)) {
      const url = `${BASE_URL}/v2/projects/tag/${project_id}`;
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({ tagId: selected.id }),
      };

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          const errorMessage = await response.text();
          // throw new Error("Failed to assign tag");
          toast({
            title: `🚨 Error ${response.status}: ${response.statusText}`,
            description: `
        🔥 error: ${errorMessage || 'An unexpected error occurred.'}
        
        🗂️ file: button-add-projecttag.tsx
            `,
            variant: 'default',
          });
        }
        // After adding the tag, update the local state
      } catch (error) {
        console.error(error);
      }
    }
    setOpen(false);
  };

  const handleDeleteTag = async (value: string) => {
    const url = `${BASE_URL}/v2/projects/tag/${project_id}`;
    const options = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({ tagId: value }),
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorMessage = await response.text();
        toast({
          title: `🚨 Error ${response.status}: ${response.statusText}`,
          description: `
      🔥 error: ${errorMessage || 'An unexpected error occurred.'}
      
      🗂️ file: button-add-projecttag.tsx
          `,
          variant: 'default',
        });
      }
      // Update local state to remove the deleted tag
      setSelectedTags((prev) => prev.filter((tag) => tag.id !== value));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    // Add this inside your component's return statement
    <>
      <div className="">
        <div className="flex flex-row flex-wrap items-center overflow-hidden">
          {Array.isArray(selectedTags) && selectedTags.length > 0 ? (
            selectedTags.map((tag) => {
              // Only show Accept/Rework tags to Head users
              if (['Approve', 'Rework'].includes(tag.name) && !isHead) return null;

              return (
                <Badge
                  key={tag.id}
                  variant="destructive"
                  className={cn(
                    'h-7 min-w-fit px-[8px] py-[12px] flex items-center justify-center border-x border-y mr-1 mt-1 mb-1',
                    tag.name === 'Accept' || tag.name === 'Rework'
                      ? 'bg-[#eefafd] border-blue text-blue'
                      : 'bg-[#EEFDF7] border-[#69BCA0] text-[#69BCA0]',
                  )}>
                  <span className="text-base font-medium font-BaiJamjuree">{tag.name}</span>
                  {isHead && ( // Only show delete button for Head users
                    <button
                      type="button"
                      onClick={() => handleDeleteTag(tag.id)}
                      className="text-red-500 ml-1 max-w-20">
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </Badge>
              );
            })
          ) : (
            <div />
          )}

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className="border-brown text-brown">
              <Button variant="outline">
                <p className="p-ui">Add tag</p>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" side="right" align="start">
              <Command>
                <CommandInput placeholder="Add tag ..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {statuses.map((status) => {
                      // Hide Accept/Rework from non-Head users
                      if (['Approve', 'Rework'].includes(status.name) && !isHead) return null;

                      return (
                        <CommandItem key={status.id} value={status.name} onSelect={handleSelectTag}>
                          <Circle
                            className={cn(
                              'mr-2 h-4 w-4',
                              status.name === 'Approve' || status.name === 'Rework'
                                ? 'fill-blue text-blue'
                                : 'fill-greenLight text-greenLight',
                              selectedTags.some((tag) => tag.id === status.id)
                                ? 'opacity-100'
                                : 'opacity-40',
                            )}
                          />
                          <span>{status.name}</span>
                        </CommandItem>
                      );
                    })}
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
