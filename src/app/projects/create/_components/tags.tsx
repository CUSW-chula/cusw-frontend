import * as React from 'react';
import { Circle, XCircle } from 'lucide-react';
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
import BASE_URL from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { Badge } from '@/components/ui/badge';
import type { FormInput } from '@/app/types/createProjectType';
import type { TagProps } from '@/app/types/types';
import { fetchData } from '@/service/fetchService';

interface ProjectTagProps {
  value: FormInput;
  onChange: (value: TagProps[]) => void;
}

export const ProjectTag = ({ value, onChange }: ProjectTagProps) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [open, setOpen] = React.useState(false);
  const [statuses, setStatuses] = React.useState<TagProps[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<TagProps[]>(value.projectTag ?? []);

  React.useEffect(() => {
    const fetchTags = async () => {
      const response = await fetchData(
        `${BASE_URL}/v2/tags/`,
        'GET',
        {},
        auth,
        'Get Tags From Server Fail.',
      );
      setStatuses(response);
    };
    fetchTags();
  }, [auth]);

  const handleSelectTag = async (value: string) => {
    onChange(selectedTags);
    //   setSelectedTags()
    setOpen(false);
  };

  const handleDeleteTag = async (value: string) => {
    onChange(selectedTags);
    //   setSelectedTags()
    setOpen(false);
  };
  return (
    <div className="flex flex-row flex-wrap items-center   overflow-hidden  ">
      {Array.isArray(selectedTags) && selectedTags.length > 0 ? (
        selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="destructive"
            className="h-7 min-w-fit px-[8px] py-[12px] flex items-center justify-center bg-[#EEFDF7] border-x border-y border-[#69BCA0] text-[#69BCA0]  mr-1 mt-1 mb-1">
            <span className="text-base font-medium font-BaiJamjuree">{tag.name}</span>
            <button
              type="button"
              onClick={() => handleDeleteTag(tag.id)}
              className="text-red-500 ml-1 max-w-20">
              <XCircle className="h-4 w-4" />
            </button>
          </Badge>
        ))
      ) : (
        <div />
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className=" border-brown text-brown ">
          <Button variant="outline">
            <p className="p-ui">Add Tag</p>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <CommandInput placeholder="Add Tag ..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {statuses.map((status) => (
                  <CommandItem key={status.id} value={status.name} onSelect={handleSelectTag}>
                    <Circle
                      className={cn(
                        'mr-2 h-4 w-4 fill-greenLight text-greenLight',
                        Array.isArray(selectedTags) &&
                          selectedTags.some((tag) => tag.id === status.id)
                          ? 'opacity-100'
                          : 'opacity-40',
                      )}
                    />
                    <span>{status.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
