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
import { TooltipProvider } from '@/components/ui/tooltip';
import { Profile } from './profile';
import BASE_URL, { BASE_SOCKET } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import type { Project } from '@/lib/shared';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface UsersInterfaces {
  id: string;
  name: string;
  email: string;
}

export function AssignedProjectOwner({ project }: { project: Project }) {
  const [open, setOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UsersInterfaces[]>([]);
  const [usersList, setUsersList] = React.useState<UsersInterfaces[]>([]);
  const [auth, setAuth] = React.useState('');
  const [isMounted, setIsMounted] = React.useState(false);

  // Client-side only initialization
  React.useEffect(() => {
    setIsMounted(true);
    setAuth(getCookie('auth')?.toString() || '');
  }, []);

  // Safe users fetch
  React.useEffect(() => {
    if (!isMounted || !auth) return;

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/users`, {
          headers: { Authorization: auth },
        });
        if (!response.ok) {
          const errorMessage = await response.text();
          toast({
            title: `🚨 Error ${response.status}: ${response.statusText}`,
            description: `
                 🔥 error: ${errorMessage || 'An unexpected error occurred.'}
                 
                 🗂️ file: assigned-projectowner.tsx
                     `,
            variant: 'default',
          });
        }
        const data = await response.json();
        setUsersList(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, [auth, isMounted]);

  // Initialize selected user safely
  React.useEffect(() => {
    if (isMounted && project?.owner) {
      setSelectedUser(project.owner);
    }
  }, [project, isMounted]);

  // WebSocket connection
  React.useEffect(() => {
    if (!isMounted || !auth || !project) return;

    const ws = new WebSocket(BASE_SOCKET);

    const handleMessage = (event: MessageEvent) => {
      try {
        const { eventName, data } = JSON.parse(event.data);
        if (eventName === `owner:${project.id}`) {
          setSelectedUser((prev) => [
            ...prev.filter((u) => u.id !== data.id),
            { id: data.id, name: data.name, email: data.email },
          ]);
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

    try {
      const response = await fetch(
        `${BASE_URL}/v2/projects/owner`,
        {
          method: 'PATCH',
          headers: { Authorization: auth },
          body: JSON.stringify({
            userId: user.id,
            projectId: project.id
          }),
        },
      );
      if (!response.ok) {
        const errorMessage = await response.text();
        toast({
          title: `🚨 Error ${response.status}: ${response.statusText}`,
          description: `
      🔥 error: ${errorMessage || 'An unexpected error occurred.'}
      
      🗂️ file: assigned-projectowner.tsx
          `,
          variant: 'default',
        });
      } else {
        toast({
          title: '✅ Success',
          description: 'Project owner updated successfully.',
          variant: 'default',
        });
      }

      setSelectedUser((prev) =>
        prev.some((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user],
      );
    } catch (error) {
      console.error('Error updating owner:', error);
      toast({
        title: '🚨 Error',
        description: 'An unexpected error occurred while updating the project owner.',
        variant: 'default',
      });
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-row gap-1 flex-wrap">
        <div className="flex items-center space-x-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div>
                {' '}
                {/* Critical wrapper to prevent button nesting */}
                <Button type="button" variant="outline" className="border-brown text-brown">
                  {selectedUser.length > 0 ? (
                    <div className="flex space-x-2">
                      {selectedUser.map((user) => (
                        <Profile
                          key={user.id}
                          userId={user.id}
                          userName={user.name}
                          fallback={<Skeleton className="h-6 w-6 rounded-full" />}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="p-ui">Assigned</p>
                  )}
                </Button>
              </div>
            </PopoverTrigger>

            <PopoverContent className="p-0" side="right" align="start">
              <Command>
                <CommandInput placeholder="Search Member..." />
                <CommandList>
                  <CommandEmpty>No members found</CommandEmpty>
                  <CommandGroup>
                    {usersList.map((user) => (
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
