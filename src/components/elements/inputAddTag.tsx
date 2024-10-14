'use client';

import * as React from 'react';
import {
  ArrowUpCircle,
  CheckCircle2,
  Circle,
  HelpCircle,
  type LucideIcon,
  XCircle,
  CircleFadingPlus,
} from 'lucide-react';

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

type Status = {
  value: string;
  label: string;
  icon: LucideIcon;
};

const statuses: Status[] = [
  {
    value: 'backlog',
    label: 'Backlog',
    icon: Circle,
  },
  {
    value: 'todo',
    label: 'Todo',
    icon: Circle,
  },
  {
    value: 'in progress',
    label: 'In Progress',
    icon: Circle,
  },
  {
    value: 'done',
    label: 'Done',
    icon: Circle,
  },
  {
    value: 'canceled',
    label: 'Canceled',
    icon: Circle,
  },
];
import { Tag } from 'lucide-react';
export function ComboboxPopover() {
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(null);

  return (
    <>
      <div className="flex items-center space-x-4">
        <div className="flex flex-basis-* gap-2">
          <Tag />
          <p className="detail">Tag :</p>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CircleFadingPlus className="mr-2 h-4 w-4 " /> <p className="p-ui">Add Tag</p>
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
                      onSelect={(value) => {
                        setSelectedStatus(
                          statuses.find((priority) => priority.value === value) || null,
                        );
                        setOpen(false);
                      }}>
                      <status.icon
                        className={cn(
                          'mr-2 h-4 w-4 fill-yellow',
                          status.value === selectedStatus?.value ? 'opacity-100' : 'opacity-40',
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
    </>
  );
}
