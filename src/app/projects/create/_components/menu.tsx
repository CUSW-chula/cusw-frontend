import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getCookie } from 'cookies-next';
import { CrownIcon, Tag } from 'lucide-react';

export const MenuBar = () => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

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
            <Tooltip key={auth}>
              <TooltipTrigger>
                <div className="w-[24px] h-[24px] bg-gray-100 rounded-full border flex items-center justify-center border-brown text-brown text-sm font-BaiJamjuree">
                  {getInitials(auth)}
                </div>
              </TooltipTrigger>
              <span className="text-black text-sm font-BaiJamjuree">{auth}</span>
              <TooltipContent>{auth}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      <div aria-label="tag" className="justify-start items-center inline-flex flex-wrap w-full">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex self-start ">
          {/* Icon */}
          <Tag className="w-6 h-6 relative" />
          {/* Description */}
          <div className="text-[#6b5c56] text-xs font-medium font-BaiJamjuree leading-tight">
            Tag :{' '}
          </div>
        </div>
        <div className="flex w-[253.67px] ">{/* <ButtonAddTags project_id={project_id} /> */}</div>
      </div>
    </div>
  );
};
