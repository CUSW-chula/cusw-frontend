'use client';

import * as React from 'react';
import { Circle, CircleFadingPlus } from 'lucide-react';

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Import TooltipProvider
import { Profile } from './profile';
import BASE_URL, { BASE_SOCKET, Task, User, type TaskManageMentProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import type { TaskProps } from '@/app/types/types';
import { toast } from '@/hooks/use-toast';
import { useToast } from '@/hooks/use-toast';

interface UsersInterfaces {
  id: string;
  name: string;
  email: string;
}

export function AssignedTaskToMember({ task, canAssignTask }: { task: TaskProps, canAssignTask: boolean }) {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [open, setOpen] = React.useState(false);
  const [taskMembers, setTaskMembers] = React.useState<UsersInterfaces[]>([]);
  const [usersList, setUsersList] = React.useState<UsersInterfaces[]>([]);
  const [owner, setOwner] = React.useState<UsersInterfaces[]>([]);
  const MAX_VISIBLE_MEMBERS = 3;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const pareJsonValue = React.useCallback((values: any) => {
    const newValue: UsersInterfaces = {
      id: values.id,
      email: values.email,
      name: values.name,
    };
    return newValue;
  }, []);

  React.useEffect(() => {
    const fetchAssignUsers = async () => {
      const usersData = await fetch(`${BASE_URL}/v2/users/project/${task.projectId}`, {
        headers: {
          Authorization: auth,
        },
      });
      if (!usersData.ok) {
        const errorMessage = await usersData.text();
        // throw new Error("Failed to assign tag");
      }
      const userList = await usersData.json();
      setUsersList(userList);
    };

    fetchAssignUsers();

    const fetchProject = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/projects/${task.projectId}`, {
          headers: {
            Authorization: auth,
          },
        });
        if (!response.ok) {
          const errorMessage = await response.text();
          // throw new Error("Failed to assign tag");
        }
        const data = await response.json();
      } catch (error) {
        console.error('Error fetching Owner:', error);
      }
    };
    fetchProject();

    setTaskMembers(task.members);

    const ws = new WebSocket(BASE_SOCKET);

    ws.onopen = () => {};

    ws.onmessage = (event) => {
      try {
        const socketEvent = JSON.parse(event.data); // Parse incoming message
        const eventName = socketEvent.eventName;
        if (eventName === `assigned:${task.id}`) {
          const data = pareJsonValue(socketEvent.data);
          setTaskMembers((prevList) => (Array.isArray(prevList) ? [...prevList, data] : []));
        }
        if (eventName === `unassigned:${task.id}`) {
          const data = pareJsonValue(socketEvent.data);
          setTaskMembers((prevList) =>
            Array.isArray(prevList) ? prevList.filter((item) => item.id !== data.id) : [],
          );
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {};

    return () => {
      ws.close();
    };
  }, [pareJsonValue, task, auth]);

  // Handle user selection and unselection
  const handleSelectUser = async (value: string) => {
    const selected = usersList.find((user) => user.name === value);
    if (selected) {
      const isAlreadySelected = taskMembers.some((user) => user.id === selected.id);

      const url = isAlreadySelected
        ? `${BASE_URL}/v2/tasks/unassigned/${task.id}` // Unassign user
        : `${BASE_URL}/v2/tasks/assign/${task.id}`; // Assign user

      const options = {
        method: isAlreadySelected ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({ userId: selected.id }),
      };

      try {
        const response = await fetch(url, options);
        if (response.ok) {
          if (options.method === 'POST')
            toast({
              title: 'Complete',
              description: `You assigned "${selected.name}" to this task`,
              variant: 'default',
            });
          else if (options.method === 'DELETE')
            toast({
              title: 'Complete',
              description: `You unassigned "${selected.name}" from this task`,
              variant: 'default',
            });
        } else {
          const errorMessage = await response.text();
        }
      } catch (error) {
        toast({
          title: 'Error unassigning user',
          description: 'An error occurred while unassigning the user from this task.',
        });
        console.error(error);
      }
    }
    setOpen(false);
  };

  const { toast } = useToast();

  return (

   <TooltipProvider>
  <div className="flex flex-row gap-1 flex-wrap">
    <div className="flex items-center space-x-4">
      {canAssignTask ? (
        // ✅ กรณีมีสิทธิ์ assign → ใช้ Popover + ปุ่มกดได้
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild className="border-brown text-brown">
            <Button variant="outline" className="h-8 px-2">
              {taskMembers.length > 0 ? (
                <div className="flex space-x-2 items-center">
                  {taskMembers.slice(0, MAX_VISIBLE_MEMBERS).map((user) => (
                    <Profile key={user.id} userId={user.id} userName={user.name} />
                  ))}
                  {taskMembers.length > MAX_VISIBLE_MEMBERS && (
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="w-[24px] h-[24px] bg-gray-100 rounded-xl border border-[#6b5c56] flex-col justify-center items-center gap-2.5 inline-flex text-center text-[#6b5c56] text-xs font-medium font-BaiJamjuree leading-3">
                          +{taskMembers.length - MAX_VISIBLE_MEMBERS}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {taskMembers.slice(MAX_VISIBLE_MEMBERS).map((user) => (
                          <p key={user.id}>{user.name}</p>
                        ))}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              ) : (
                <p className="p-ui text-sm">Assigned</p>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" side="right" align="start">
            <Command>
              <CommandInput placeholder="Search member ..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {usersList.map((user) => (
                    <CommandItem key={user.id} value={user.name} onSelect={handleSelectUser}>
                      <Circle
                        className={cn(
                          'mr-2 h-4 w-4 fill-greenLight text-greenLight ',
                          taskMembers?.length > 0 && taskMembers.some((u) => u.id === user.id)
                            ? 'opacity-100'
                            : 'opacity-40',
                        )}
                      />
                      <span>{user.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ) : (
  // ❌ ไม่มีสิทธิ์ assign → แสดงเป็น read-only
  <>
    {taskMembers.length > 0 && (
      <div className="h-8 px-2 border border-brown rounded-md flex items-center">
        <div className="flex space-x-2 items-center">
          {taskMembers.slice(0, MAX_VISIBLE_MEMBERS).map((user) => (
            <Profile key={user.id} userId={user.id} userName={user.name} />
          ))}
          {taskMembers.length > MAX_VISIBLE_MEMBERS && (
            <Tooltip>
              <TooltipTrigger>
                <div className="w-[24px] h-[24px] bg-gray-100 rounded-xl border border-[#6b5c56] flex-col justify-center items-center gap-2.5 inline-flex text-center text-[#6b5c56] text-xs font-medium font-BaiJamjuree leading-3">
                  +{taskMembers.length - MAX_VISIBLE_MEMBERS}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {taskMembers.slice(MAX_VISIBLE_MEMBERS).map((user) => (
                  <p key={user.id}>{user.name}</p>
                ))}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    )}
  </>
)
}
    </div>
  </div>
</TooltipProvider>

  );
}
