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
import { Skeleton } from '@/components/ui/skeleton';
import { getUserRoleOnProjectTask } from '@/service/userService';
import { can } from '@/permissions/helper';

interface UsersInterfaces {
  id: string;
  name: string;
  email: string;
}

interface AssignedProjectOwnerProps {
  project: Project;
  isMember?: boolean;
}

export const AssignedProjectOwner: React.FC<AssignedProjectOwnerProps> = ({
  project,
  isMember = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UsersInterfaces[]>([]);
  const [usersList, setUsersList] = React.useState<UsersInterfaces[]>([]);
  const [auth, setAuth] = React.useState('');
  const [isMounted, setIsMounted] = React.useState(false);
  const [hasEditPermission, setHasEditPermission] = React.useState(false);

  const MAX_VISIBLE_MEMBERS = 3;

  React.useEffect(() => {
    setIsMounted(true);
    setAuth(getCookie('auth')?.toString() || '');
  }, []);

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
    const checkPermission = async () => {
      const { projectRole, taskRole, isAdmin, isHead } = await getUserRoleOnProjectTask({
        projectId: project.id,
      });
      setHasEditPermission(can('editProjectOwner', { projectRole, taskRole, isAdmin, isHead }));
    };

    checkPermission();
  }, [project]);

  React.useEffect(() => {
    if (!isMounted || !auth) return;
    fetchUsers();
  }, [auth, isMounted, fetchUsers]);

  React.useEffect(() => {
    if (isMounted && project?.owner) {
      setSelectedUser(project.owner);
    }
  }, [project, isMounted]);

  React.useEffect(() => {
    if (!isMounted || !auth || !project) return;
    const ws = new WebSocket(BASE_SOCKET);

    const handleMessage = (event: MessageEvent) => {
      try {
        const { eventName, data } = JSON.parse(event.data);
        if (eventName === `owner:${project.id}`) {
          // อัปเดต selectedUser จาก WebSocket เมื่อมีการเปลี่ยนแปลงจาก client อื่น
          // แต่ต้องตรวจสอบให้แน่ใจว่าไม่ duplicate กับการ update จาก handleSelectUser
          setSelectedUser((prev) => {
            const exists = prev.some((u) => u.id === data.id);
            if (exists) {
              // ถ้ามีแล้ว ให้ลบออก
              return prev.filter((u) => u.id !== data.id);
            }
            // ถ้าไม่มี ให้เพิ่มเข้าไป (แต่ตรวจสอบ duplicate ก่อน)
            const newUser = { id: data.id, name: data.name, email: data.email };
            const isDuplicate = prev.some((u) => u.id === newUser.id);
            return isDuplicate ? prev : [...prev, newUser];
          });
        } else if (typeof eventName === 'string' && /user/i.test(eventName)) {
          // เมื่อมีการเปลี่ยนแปลงข้อมูลผู้ใช้ ให้รีเฟรช dropdown รายชื่อผู้ใช้
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
    interval = setInterval(fetchUsers, 15000);
    window.addEventListener('focus', onFocus);
    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [open, fetchUsers]);

  // Filter out project creator from dropdown to prevent removing themselves
  const filteredUsersList = React.useMemo(
    () => usersList.filter((u) => u.id !== project?.createdById),
    [usersList, project?.createdById],
  );

  const handleSelectUser = async (userName: string) => {
    if (!isMounted || !project || isMember) return; // เพิ่มการตรวจสอบ isMember

    const user = usersList.find((u) => u.name === userName);
    if (!user) return;

    try {
      const response = await fetch(`${BASE_URL}/v2/projects/owner/${project.id}`, {
        method: 'PATCH',
        headers: { Authorization: auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        toast({
          title: '✅ Success',
          description: 'Project owner updated successfully.',
        });
        setSelectedUser((prev) => {
          const exists = prev.some((u) => u.id === user.id);
          if (exists) {
            return prev.filter((u) => u.id !== user.id);
          }
          const isDuplicate = prev.some((u) => u.id === user.id);
          return isDuplicate ? prev : [...prev, user];
        });
      }
    } catch (error) {
      console.error('Error updating owner:', error);
      toast({
        title: '🚨 Error',
        description: 'An unexpected error occurred while updating the project owner.',
      });
    }
  };

  const handlePopoverOpenChange = (newOpen: boolean) => {
    if (!isMember) {
      setOpen(newOpen);
    }
  };

  const handleButtonClick = () => {
    if (!isMember) {
      setOpen(!open);
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
      <div className="flex items-center gap-2">
        {/* แสดงข้อมูล owner */}
        <div className="flex items-center gap-2">
          <Popover open={open} onOpenChange={handlePopoverOpenChange}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                disabled={!hasEditPermission}
                variant="outline"
                className={cn(
                  'border-brown text-brown h-8 px-2 hover:bg-gray-50',
                  isMember && 'cursor-default',
                )}
                onClick={handleButtonClick}>
                {selectedUser.length > 0 ? (
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const validUsers = selectedUser.filter((user) => user?.id && user?.name);

                      return (
                        <>
                          {validUsers.slice(0, MAX_VISIBLE_MEMBERS).map((user) => (
                            <Profile
                              key={user.id}
                              userId={user.id}
                              userName={user.name}
                              fallback={<Skeleton className="h-5 w-5 rounded-full" />}
                            />
                          ))}
                          {validUsers.length > MAX_VISIBLE_MEMBERS && (
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="w-[24px] h-[24px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
                                  <span className="text-brown text-[12px] font-BaiJamjuree">
                                    +{validUsers.length - MAX_VISIBLE_MEMBERS}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="flex flex-col gap-1">
                                  {validUsers.slice(MAX_VISIBLE_MEMBERS).map((own) => {
                                    if (!own?.id || !own?.name) return null;
                                    return (
                                      <span key={own.id} className="text-xs font-medium text-black">
                                        {own.name}
                                      </span>
                                    );
                                  })}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="p-ui text-sm">Assigned</p>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0" side="right" align="start">
              <Command>
                <CommandInput placeholder="Search member..." />
                <CommandList>
                  <CommandEmpty>No members found</CommandEmpty>
                  <CommandGroup>
                    {filteredUsersList.map((user) => (
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
