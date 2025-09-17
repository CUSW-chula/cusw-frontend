import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import { Button } from '../ui/button';
import type { TaskProps } from '@/app/types/types';
import BASE_URL, { type User } from '@/lib/shared';
import { getCookie } from 'cookies-next/client';

const getInitials = (name: string) => {
  const nameParts = name.split(' ');
  return nameParts.map((part) => part[0]).join('');
};

const getFirstName = (name: string) => {
  const nameParts = name.split(' ');
  return nameParts[0];
};

export const ShowTaskCreator = ({ task }: { task: TaskProps }) => {
  const [creator, setCreator] = useState<{ id: string; name: string } | null>(null);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/users/${task.createdById}`, {
          headers: {
            Authorization: auth,
          },
        });

        if (!response.ok) {
          console.error('Failed to fetch owner:', await response.text());
          return;
        }

        const data = await response.json();
        setCreator({ id: data.id, name: data.name }); // ปรับให้ตรงกับ response จริง
      } catch (error) {
        console.error('Error fetching Owner:', error);
      }
    };

    if (task.createdById) fetchOwner();
  }, [task.createdById]);

  if (!creator) return null; // ยังโหลดอยู่ ไม่แสดงอะไร

  return (
    <TooltipProvider>
      <Button variant="outline" className="flex gap-x-2 border-brown text-brown h-8 px-2">
        <Tooltip key={creator.id}>
          <TooltipTrigger>
            <div className="flex items-center space-x-2 w-auto">
              <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
                <span className="text-brown text-xs font-BaiJamjuree">
                  {getInitials(creator.name)}
                </span>
              </div>
              <p className="text-sm font-BaiJamjuree">{getFirstName(creator.name)}</p>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-white text-black rounded-md px-2 py-1 shadow-md border border-gray-200">
            <span>{creator.name}</span>
          </TooltipContent>
        </Tooltip>
      </Button>
    </TooltipProvider>
  );
};
