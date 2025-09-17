'use client';

import * as React from 'react';
import { Button } from '../ui/button';
import type { TaskProps } from '@/app/types/types';
import BASE_URL, { type User } from '@/lib/shared';
import { getCookie } from 'cookies-next/client';
import { toast } from '@/hooks/use-toast';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { useEffect, useState } from 'react';
import { getUserRoleOnProjectTask } from '@/service/userService';
import { can } from '@/permissions/helper';

export function ProjectOwner({ task }: { task: TaskProps }) {
  const [owner, setOwner] = React.useState<User[]>([]);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    return nameParts.map((part) => part[0]).join('');
  };

  const getFirstName = (name: string) => {
    const nameParts = name.split(' ');
    return nameParts[0];
  };

  React.useEffect(() => {
    const fetchOwner = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/projects/${task.projectId}`, {
          headers: {
            Authorization: auth,
          },
        });
        if (!response.ok) {
          const errorMessage = await response.text();
        }
        const data = await response.json();
        setOwner(data.owner);
      } catch (error) {
        console.error('Error fetching Owner:', error);
      }
    };
    fetchOwner();
  }, [task.projectId, auth]);
  const [hasEditPermission, setHasEditPermission] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const { projectRole, taskRole, isAdmin, isHead } = await getUserRoleOnProjectTask({
        projectId: task.projectId,
        taskId: task.id,
      });
      setHasEditPermission(can('editProjectOwner', { projectRole, taskRole, isAdmin, isHead }));
    };

    checkPermission();
  }, [task.projectId, task.id]);
  return (
    <TooltipProvider>
      <div className="flex flex-row gap-1 flex-wrap">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <Button
              variant={'outline'}
              className="flex gap-x-2 border-brown text-brown h-8 px-2"
              // disabled={!hasEditPermission}
            >
              {owner.length === 1 ? (
                <Tooltip key={owner[0].id}>
                  <TooltipTrigger>
                    <div className="flex items-center space-x-2 w-auto">
                      <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
                        <span className="text-brown text-xs font-BaiJamjuree">
                          {getInitials(owner[0].name)}
                        </span>
                      </div>
                      <p className="text-sm font-BaiJamjuree">{getFirstName(owner[0].name)}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{owner[0].name}</span>
                  </TooltipContent>
                </Tooltip>
              ) : (
                owner?.slice(0, 3).map((user) => (
                  <Tooltip key={user.id}>
                    <TooltipTrigger>
                      <div className="flex items-center space-x-2">
                        <div className="w-[24px] h-[24px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
                          <span className="text-brown text-[12px] font-BaiJamjuree">
                            {getInitials(user.name)}
                          </span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{user.name}</span>
                    </TooltipContent>
                  </Tooltip>
                ))
              )}
              {owner.length > 3 && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center space-x-2">
                      <div className="w-[24px] h-[24px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
                        <span className="text-brown text-[12px] font-BaiJamjuree">
                          +{owner.length - 3}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-col">
                      {owner.slice(3).map((user) => (
                        <span key={user.id}>{user.name}</span>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
