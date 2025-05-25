'use client';

import * as React from 'react';
import { Circle } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Profile } from './profile';
import BASE_URL, { BASE_SOCKET, type Project } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { toast } from '@/hooks/use-toast';

interface UsersInterfaces {
  id: string;
  name: string;
  email: string;
}

export function AssignedProjectMember({ project }: { project: Project }) {
  const [open, setOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UsersInterfaces[]>([]);
  const [usersList, setUsersList] = React.useState<UsersInterfaces[]>([]);
  const [auth, setAuth] = React.useState('');
  const [isMounted, setIsMounted] = React.useState(false);
  const MAX_VISIBLE_MEMBERS = 3;

  React.useEffect(() => {
    setIsMounted(true);
    setAuth(getCookie('auth')?.toString() || '');
  }, []);

  React.useEffect(() => {
    if (!isMounted || !auth) return;

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/users`, {
          headers: { Authorization: auth },
        });
        if (!response.ok) {
          const errorMessage = await response.text();

          return;
        }
        const data = await response.json();
        setUsersList(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, [auth, isMounted]);

  React.useEffect(() => {
    if (isMounted && project?.members) {
      setSelectedUser(project.members);
    }
  }, [project, isMounted]);

  React.useEffect(() => {
    if (!isMounted || !auth || !project) return;

    const ws = new WebSocket(BASE_SOCKET);

    const handleMessage = (event: MessageEvent) => {
      try {
        const { eventName, data } = JSON.parse(event.data);
        if (
          (eventName === 'assigned' || eventName === 'unassigned') &&
          data.projectId === project.id
        ) {
          setSelectedUser(data.members);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => {
      ws.removeEventListener('message', handleMessage);
      ws.close();
    };
  }, [auth, project, isMounted]);

  const handleSelectUser = async (userName: string) => {
    if (!isMounted || !project) return;

    const user = usersList.find((u) => u.name === userName);
    if (!user) return;

    if (project.owner.some((owner) => owner.id === user.id)) {
      toast({
        title: '🚫 Action not allowed',
        description: 'The project owner cannot assign themselves to the project.',
        variant: 'default',
      });
      return;
    }

    try {
      const method = selectedUser.some((u) => u.id === user.id) ? 'DELETE' : 'POST';
      const response = await fetch(`${BASE_URL}/v2/projects/assign/${project.id}`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!response.ok) {
        const errorMessage = await response.text();
      } else {
        const data = await response.json();
        setSelectedUser((prev) =>
          prev.some((u) => u.id === user.id)
            ? prev.filter((u) => u.id !== user.id)
            : [...prev, user],
        );
        toast({
          title: '✅ Success',
          description: `User ${user.name} has been ${method === 'POST' ? 'assigned to' : 'removed from'} the project.`,
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error updating owner:', error);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-row gap-1 flex-wrap">
        <div className="flex items-center space-x-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className="border-brown text-brown">
              <Button variant="outline" className="h-8 px-2">
                {selectedUser.length > 0 ? (
                  <div className="flex space-x-2 items-center">
                    {selectedUser.slice(0, MAX_VISIBLE_MEMBERS).map((user) => (
                      <Profile key={user.id} userId={user.id} userName={user.name} />
                    ))}
                    {selectedUser.length > MAX_VISIBLE_MEMBERS && (
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="w-[24px] h-[24px] bg-gray-100 rounded-xl border border-[#6b5c56] flex-col justify-center items-center gap-2.5 inline-flex text-center text-[#6b5c56] text-xs font-medium font-BaiJamjuree leading-3">
                            +{selectedUser.length - MAX_VISIBLE_MEMBERS}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {selectedUser.slice(MAX_VISIBLE_MEMBERS).map((user) => (
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
                  <CommandEmpty>No members found.</CommandEmpty>
                  <CommandGroup>
                    {usersList
                      .filter((user) => !project.owner.some((owner) => owner.id === user.id))
                      .map((user) => (
                        <CommandItem
                          key={user.id}
                          value={user.name}
                          onSelect={() => handleSelectUser(user.name)}>
                          <Circle
                            className={cn(
                              'mr-2 h-4 w-4 fill-greenLight text-greenLight',
                              selectedUser.some((u) => u.id === user.id)
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
