'use client';

import * as React from 'react';
import { Button } from '../ui/button';
import type { TaskProps } from '@/app/types/types';
import BASE_URL, { type User } from '@/lib/shared';
import { getCookie } from 'cookies-next/client';

// mock data (default users)
// const users: UsersInterfaces[] = [{ id: '1', userName: 'Bunyaphon Kongthum' }];

export function ProjectOwner({ task }: { task: TaskProps }) {
  const [owner, setOwner] = React.useState<User[]>([]);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  // Function to get initials from a full name
  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    return nameParts.map((part) => part[0]).join(''); // Take the first letter of each part
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
        const data = await response.json();
        setOwner(data.owner);
      } catch (error) {
        console.error('Error fetching Owner:', error);
      }
    };
    fetchOwner();
  }, [task.projectId, auth]);

  return (
    <>
      <div className="flex flex-row gap-1 flex-wrap ">
        <div className="flex items-center space-x-4 ">
          <div className="flex space-x-2">
            <Button variant={'outline'} className="flex gap-x-2  border-brown text-brown">
              {owner?.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  {/* Display default users as circles with initials */}
                  <div className="w-[24px] h-[24px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
                    <span className="text-brown text-[12px] font-BaiJamjuree">
                      {getInitials(user.name)}
                    </span>
                  </div>
                  <span className="text-[16px] font-BaiJamjuree ml-[4px] ">
                    {getFirstName(user.name)}
                  </span>
                </div>
              ))}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
