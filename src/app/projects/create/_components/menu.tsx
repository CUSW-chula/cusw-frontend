import type { FormInput } from '@/app/types/createProjectType';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CrownIcon, Tag } from 'lucide-react';
import { ProjectTag } from './tags';
import { TagProps } from '@/app/types/types';

interface MenuBarProps {
  inputs: FormInput;
  owner: string;
  handleChangeTag: (value: TagProps[]) => void;
}

export const MenuBar = ({ inputs, owner, handleChangeTag }: MenuBarProps) => {
  const getInitials = (name: string) => {
    if (typeof name !== 'string') return ''; // Handle non-string input
    const nameParts = name.split(' ');
    return nameParts.map((part) => part[0]).join(''); // Take the first letter of each part
  };

  return (
    <div className="min-h-[350px] w-2/6 p-5 bg-white rounded-md border border-[#6b5c56] flex-col justify-start items-start gap-4 inline-flex">
      <div aria-label="owner" className="h-10 justify-start items-center inline-flex">
        <div className="w-24 justify-start items-center gap-2 flex">
          <CrownIcon className="w-[24px] h-[24px] text-black" />
          <div className="text-[#6b5c56] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
            Owner :{' '}
          </div>
        </div>
        {/* get Owner name from API */}
        <TooltipProvider>
          <div className="flex items-center space-x-2">
            <Tooltip key={owner}>
              <TooltipTrigger>
                <div className="w-[24px] h-[24px] bg-gray-100 rounded-full border flex items-center justify-center border-brown text-brown text-sm font-BaiJamjuree">
                  {getInitials(owner)}
                </div>
              </TooltipTrigger>
              <span className="text-black text-sm font-BaiJamjuree">{owner}</span>
              <TooltipContent>{owner}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      <div aria-label="tag" className="flex items-center ">
        <div className="w-24 justify-start items-center gap-2 flex self-start ">
          <Tag className="w-6 h-6 relative" />
          <div className="text-[#6b5c56] text-xs font-medium font-BaiJamjuree leading-tight">
            Tag :{' '}
          </div>
        </div>
        <ProjectTag value={inputs} onChange={handleChangeTag} />
      </div>
    </div>
  );
};
