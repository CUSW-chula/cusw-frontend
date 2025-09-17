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
import { can } from '@/permissions/helper';
import { getUserRoleOnProjectTask } from '@/service/userService';

interface UsersInterfaces {
  id: string;
  name: string;
  email: string;
}

interface AssignedProjectMemberProps {
  project: Project;
}

export const AssignedProjectMember: React.FC<AssignedProjectMemberProps> = ({ project }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UsersInterfaces[]>([]);
  const [usersList, setUsersList] = React.useState<UsersInterfaces[]>([]);
  const [auth, setAuth] = React.useState('');
  const [isMounted, setIsMounted] = React.useState(false);
  // Keep owner ids locally so dropdown can exclude owners in real-time
  const [ownerIds, setOwnerIds] = React.useState<string[]>([]);
  const [hasEditPermission, setHasEditPermission] = React.useState(false);
  const MAX_VISIBLE_MEMBERS = 3;

  React.useEffect(() => {
    setIsMounted(true);
    setAuth(getCookie('auth')?.toString() || '');
  }, []);

  React.useEffect(() => {
    const checkPermission = async () => {
      const { projectRole, taskRole, isAdmin, isHead } = await getUserRoleOnProjectTask({
        projectId: project.id,
      });
      setHasEditPermission(can('editProjectMember', { projectRole, taskRole, isAdmin, isHead }));
    };

    checkPermission();
  }, [project]);

  const fetchUsers = React.useCallback(async () => {
    if (!auth) return;
    try {
      const response = await fetch(`${BASE_URL}/v2/users/`, {
        headers: { Authorization: auth },
      });
      if (!response.ok) return;
      const data = await response.json();
      setUsersList(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, [auth]);

  React.useEffect(() => {
    if (!isMounted || !auth) return;
    fetchUsers();
  }, [auth, isMounted, fetchUsers]);

  React.useEffect(() => {
    if (!isMounted || !project) return;
    if (project?.members) setSelectedUser(project.members);
    if (project?.owner) setOwnerIds(project.owner.map((o) => o.id));
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
        } else if (eventName === `owner:${project.id}`) {
          // เมื่อมีการเปลี่ยนแปลง owner ให้ fetch ข้อมูล project ใหม่เพื่ออัปเดต members
          const fetchProject = async () => {
            try {
              const response = await fetch(`${BASE_URL}/v2/projects/${project.id}`, {
                headers: { Authorization: auth },
              });
              if (response.ok) {
                const updatedProject = await response.json();
                setSelectedUser(updatedProject.members);
                setOwnerIds(updatedProject.owner?.map((o: { id: string }) => o.id) || []);
              }
            } catch (error) {
              console.error('Failed to fetch updated project:', error);
            }
          };
          fetchProject();
        } else if (typeof eventName === 'string' && /user/i.test(eventName)) {
          // Backend อาจส่งเหตุการณ์ที่เกี่ยวกับผู้ใช้ เช่น user-created, user-updated
          // ให้รีเฟรชรายการผู้ใช้เพื่อให้ dropdown อัปเดตแบบเรียลไทม์
          fetchUsers();
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
  }, [auth, project, isMounted, fetchUsers]);

  // While dropdown is open, poll users periodically and refresh on window focus
  React.useEffect(() => {
    if (!open) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const onFocus = () => fetchUsers();
    fetchUsers();
    interval = setInterval(fetchUsers, 15000); // 15s lightweight polling when open
    window.addEventListener('focus', onFocus);
    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [open, fetchUsers]);

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

  const handlePopoverOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleButtonClick = () => {
    setOpen(!open);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* แสดงรายชื่อ members */}
        <div className="flex items-center gap-2">
          <Popover open={open} onOpenChange={handlePopoverOpenChange}>
            <PopoverTrigger asChild className="border-brown text-brown">
              <Button
                variant="outline"
                disabled={!hasEditPermission}
                className={cn('h-8 px-2 hover:bg-gray-50')}
                onClick={handleButtonClick}>
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
                          <div className="flex flex-col gap-1">
                            {selectedUser.slice(MAX_VISIBLE_MEMBERS).map((user) => (
                              <p key={user.id} className="text-xs font-medium text-black">
                                {user.name}
                              </p>
                            ))}
                          </div>
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
                      .filter((user) => !ownerIds.includes(user.id))
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
};
