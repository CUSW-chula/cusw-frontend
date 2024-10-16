'use client';

import * as React from 'react';
import { Circle, type LucideIcon, XCircle, CircleFadingPlus } from 'lucide-react';

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
import { Tag } from 'lucide-react';

type NewType = {
  id: string;
  nameTag: string;
};

//Status data
type Status = NewType;

// mock data
const statuses: Status[] = [
  { id: '1', nameTag: 'Backlog' },
  { id: '2', nameTag: 'Todo' },
  { id: '3', nameTag: 'In Progress' },
  { id: '4', nameTag: 'Done' },
  { id: '5', nameTag: 'Canceled' },
];

export function ButtonAddTags() {
  const [open, setOpen] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<Status[]>([]);

  // ฟังก์ชันจัดการการเลือกแท็ก
  const handleSelectTag = (value: string) => {
    const selected = statuses.find((status) => status.id === value);
    if (selected && !selectedTags.includes(selected)) {
      setSelectedTags((prev) => [...prev, selected]); // เพิ่มแท็กที่เลือก
    }
    setOpen(false);
  };

  return (
    //Buttom Add Tag
    <>
      <div className="flex flex-row gap-1 flex-wrap">
        <div className="flex items-center space-x-4">
          <div className="flex flex-basis-* gap-2">
            <Tag />
            <p className="detail">Tag :</p>
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CircleFadingPlus className="mr-2 h-4 w-4" /> <p className="p-ui">Add Tag</p>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" side="right" align="start">
              <Command>
                <CommandInput placeholder="Add Tag ..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {statuses.map((status) => (
                      <CommandItem key={status.id} value={status.id} onSelect={handleSelectTag}>
                        <Circle
                          className={cn(
                            'mr-2 h-4 w-4 fill-greenLight  text-greenLight',
                            selectedTags.some((tag) => tag.id === status.id)
                              ? 'opacity-100'
                              : 'opacity-40',
                          )}
                        />
                        <span>{status.nameTag}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {selectedTags.map(
          (
            tag, //Show selected results
          ) => (
            <Button variant="outline" key={tag.id}>
              <Circle className="mr-1 h-4 w-4 fill-greenLight text-greenLight font-BaiJamjuree " />
              <span>{tag.nameTag}</span>
              <Button
                size={'sm'}
                variant="ghost"
                onClick={() => setSelectedTags((prev) => prev.filter((t) => t.id !== tag.id))}
                className="ml-2 text-red-500 gap-1  ">
                <XCircle className="h-4 w-4 " />
              </Button>
            </Button>
          ),
        )}
      </div>
    </>
  );
}
