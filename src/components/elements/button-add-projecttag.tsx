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
import { set } from 'date-fns';
import { ProjectOwner } from './project-owner';
import { getUserRoleOnProjectTask } from '@/service/userService';
import { can } from '@/permissions/helper';

interface Tags {
  id: string;
  name: string;
}

interface ButtonAddTagsProps {
  project_id: string;
}

interface Owner {
  id: string;
  name: string;
  email: string;
  head: boolean;
  admin: boolean;
  activated: boolean;
}

export function ButtonAddTags({ project_id }: ButtonAddTagsProps) {

  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const userid = (jwtDecode(auth) as { id: string }).id;
  const [isHeadState, setIsHead] = React.useState<boolean>();
  const [isadmin, setIsAdmin] = React.useState<boolean>();
  const [isprojectOwner, setIsProjectOwner] = React.useState<boolean>();
  const [projectOwner, setProjectOwner] = React.useState<Owner[]>([]);
  const [open, setOpen] = React.useState(false);
  const [statuses, setStatuses] = React.useState<Tags[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<Tags[]>([]);
  const [hasEditPermission, setHasEditPermission] = React.useState<boolean>(false);

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
        }

        const data = await response.json();
        setIsHead(data.head);
        setIsAdmin(data.admin);
      } catch (error) {
        console.error('Error fetching Owner:', error);
      }
    };

    fetchOwner();
  }, [auth, userid]);

  useEffect(() => {
    const checkPermission = async () => {
      const { projectRole, taskRole, isAdmin, isHead } = await getUserRoleOnProjectTask({
        projectId: project_id,
      });
      setHasEditPermission(can('editProjectTag', { projectRole, taskRole, isAdmin, isHead }));
    };

    checkPermission();
  }, [project_id]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const fetchTags = async () => {
      const url = `${BASE_URL}/v2/tags/`;
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
        }
        const data = await response.json();
        setSelectedTags(data.tags);
        setProjectOwner(data.owner);
        setIsProjectOwner(data.owner.some((owner: { id: string }) => owner.id === userid));
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
  }, [auth, project_id, pareJsonValue, setSelectedTags, setProjectOwner]);

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
      }
      // Update local state to remove the deleted tag
      setSelectedTags((prev) => prev.filter((tag) => tag.id !== value));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddTag = async () => {
    if (restricted) return;
    setOpen(true);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-row max-w-[212px] flex-wrap items-center justify-start overflow-hidden gap-x-1.5">
        {Array.isArray(selectedTags) && selectedTags.length > 0
          ? selectedTags
              .sort((a, b) => {
                const aIsApprove = a.name === 'Approved';
                const bIsApprove = b.name === 'Approved';
                if (aIsApprove && !bIsApprove) return -1;
                if (!aIsApprove && bIsApprove) return 1;
                return 0;
              })
              .map((tag) => {
                // Only show Accept tags to Head/Admin users
                if (tag.name === 'Approved' && !isHeadState && !isadmin) return null;

                return (
                  <Badge
                    key={tag.id}
                    variant="destructive"
                    className={cn(
                      'h-6 w-fit max-w-[212px] flex items-center my-1 justify-center gap-1',
                      tag.name === 'Approved'
                        ? 'bg-[#eefafd] border-blue text-blue'
                        : 'bg-[#EEFDF7] border-[#69BCA0] text-[#69BCA0]',
                    )}>
                    <span className="text-sm font-BaiJamjuree font-medium text-ellipsis overflow-hidden max-w-[180px]">
                      {tag.name}
                    </span>
                    {(isHeadState || isadmin || isprojectOwner) && (
                      <button type="button" onClick={() => handleDeleteTag(tag.id)}>
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </Badge>
                );
              })
          : undefined}

        {hasEditPermission && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className="border-brown text-brown">
              {hasEditPermission && (
                <Button variant="outline" className="h-8 px-2">
                  <p className="p-ui text-sm">Add tag</p>
                </Button>
              )}
            </PopoverTrigger>
            <PopoverContent className="p-0" side="right" align="start">
              <Command>
                <CommandInput placeholder="Add tag ..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {statuses.map((status) => {
                      // Hide Accept/Rework from non-Head users
                      if (['Approved'].includes(status.name) && !isHead && !isadmin) return null;


                      return (
                        <CommandItem key={status.id} value={status.name} onSelect={handleSelectTag}>
                          <Circle
                            className={cn(
                              'mr-2 h-4 w-4',
                              status.name === 'Approved'
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
        )}
      </div>
    </div>
  );
};
