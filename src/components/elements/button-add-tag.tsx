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

//Status data
type Status = {
  value: string;
  label: string;
  icon: LucideIcon;
};

// mock data
const statuses: Status[] = [
  { value: 'backlog', label: 'Backlog', icon: Circle },
  { value: 'todo', label: 'Todo', icon: Circle },
  { value: 'in progress', label: 'In Progress', icon: Circle },
  { value: 'done', label: 'Done', icon: Circle },
  { value: 'canceled', label: 'Canceled', icon: Circle },
];

export function ButtonAddTags() {
  const [open, setOpen] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<Status[]>([]);

  // ฟังก์ชันจัดการการเลือกแท็ก
  const handleSelectTag = (value: string) => {
    const selected = statuses.find((status) => status.value === value);
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
                      <CommandItem
                        key={status.value}
                        value={status.value}
                        onSelect={handleSelectTag}>
                        <status.icon
                          className={cn(
                            'mr-2 h-4 w-4 fill-greenLight  text-greenLight',
                            selectedTags.some((tag) => tag.value === status.value)
                              ? 'opacity-100'
                              : 'opacity-40',
                          )}
                        />
                        <span>{status.label}</span>
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
            <Button variant="outline" key={tag.value}>
              <tag.icon className="mr-1 h-4 w-4 fill-greenLight text-greenLight" />
              <span>{tag.label}</span>
              <Button
                size={'sm'}
                variant="ghost"
                onClick={() => setSelectedTags((prev) => prev.filter((t) => t.value !== tag.value))}
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
