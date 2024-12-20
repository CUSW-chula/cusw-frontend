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
import { TooltipProvider } from '@/components/ui/tooltip'; // Import TooltipProvider
import { Profile } from './profile';
import BASE_URL, { BASE_SOCKET, type TaskManageMentProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';

interface UsersInterfaces {
  id: string;
  name: string;
  email: string;
}

export function AssignedTaskToMember({ task_id }: TaskManageMentProp) {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [open, setOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UsersInterfaces[]>([]);
  const [usersList, setUsersList] = React.useState<UsersInterfaces[]>([]);

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
    const fetchAssignAndUsers = async () => {
      const usersData = await fetch(`${BASE_URL}/users`, {
        headers: {
          Authorization: auth,
        },
      });
      const userList = await usersData.json();
      setUsersList(userList);

      const assignData = await fetch(`${BASE_URL}/tasks/getassign/${task_id}`, {
        headers: {
          Authorization: auth,
        },
      });
      const assignList = await assignData.json();
      setSelectedUser(Array.isArray(assignList) ? assignList : []); // Ensure array format
    };

    fetchAssignAndUsers();

    const ws = new WebSocket(BASE_SOCKET);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const socketEvent = JSON.parse(event.data); // Parse incoming message
        const eventName = socketEvent.eventName;
        const data = pareJsonValue(socketEvent.data); // Comment Data
        setSelectedUser((prevList) =>
          Array.isArray(prevList) // Ensure array
            ? eventName === 'assigned'
              ? [...prevList, data] // Functional update
              : prevList.filter((item) => item.id !== data.id) // Remove deleted comment
            : [],
        );
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

  // Handle user selection and unselection
  const handleSelectUser = async (value: string) => {
    const selected = usersList.find((user) => user.name === value);
    if (selected) {
      const isAlreadySelected = selectedUser.some((user) => user.id === selected.id);

      const url = isAlreadySelected
        ? `${BASE_URL}/tasks/unassigned` // Unassign user
        : `${BASE_URL}/tasks/assign`; // Assign user

      const options = {
        method: isAlreadySelected ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({ taskId: task_id, userId: selected.id }),
      };

      try {
        await fetch(url, options);
      } catch (error) {
        console.error(error);
      }
    }
    setOpen(false);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-row gap-1 flex-wrap">
        <div className="flex items-center space-x-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {selectedUser.length > 0 ? (
                  // Display selected users as circles with initials
                  <div className="flex space-x-2">
                    {selectedUser.map((user) => (
                      <Profile key={user.id} userId={user.id} userName={user.name} />
                    ))}
                  </div>
                ) : (
                  <>
                    <CircleFadingPlus className="mr-2 h-4 w-4" />
                    <p className="p-ui">Assigned</p>
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" side="right" align="start">
              <Command>
                <CommandInput placeholder="Search Member ..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {usersList.map((user) => (
                      <CommandItem key={user.id} value={user.name} onSelect={handleSelectUser}>
                        <Circle
                          className={cn(
                            'mr-2 h-4 w-4 fill-greenLight text-greenLight',
                            selectedUser?.length > 0 && selectedUser.some((u) => u.id === user.id)
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
        </div>
      </div>
    </TooltipProvider>
  );
}
