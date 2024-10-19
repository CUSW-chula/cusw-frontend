'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';

const unassigned = '/asset/icon/unassigned.svg';
const assigned = '/asset/icon/assigned.svg';
const inreview = '/asset/icon/inreview.svg';
const inrecheck = '/asset/icon/inrecheck.svg';
const done = '/asset/icon/done.svg';

interface Status {
  value: string;
  label: string;
  icon: string; // Icon should be a React component
}

const statuses: Status[] = [
  {
    value: 'unassigned',
    label: 'unassigned',
    icon: unassigned,
  },
  {
    value: 'assigned',
    label: 'assigned',
    icon: assigned,
  },
  {
    value: 'under review',
    label: 'under review',
    icon: inreview,
  },
  {
    value: 'in recheck',
    label: 'in recheck',
    icon: inrecheck,
  },
  {
    value: 'done',
    label: 'done',
    icon: done,
  },
];

export function StatusChanging() {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status>(statuses[0]);

  return (
    <div className="flex items-center">
      <img
        src={selectedStatus?.icon}
        className="mr-2 h-4 w-4 shrink-0"
        alt={selectedStatus?.label}
      />
      <p className="text-sm text-muted-foreground ml-2 mr-4">Status:</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-[150px] justify-start font-BaiJamjuree">
            {selectedStatus ? (
              <>
                <img
                  src={selectedStatus.icon}
                  className="mr-2 h-4 w-4 shrink-0"
                  alt={selectedStatus.label}
                />
                {selectedStatus.label}
              </>
            ) : (
              <>status</>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <CommandList>
              <CommandGroup>
                {statuses.map((status) => (
                  <CommandItem
                    key={status.value}
                    value={status.value}
                    onSelect={() => {
                      const selected = statuses.find((s) => s.value === status.value);
                      if (selected) setSelectedStatus(selected);
                      setOpen(false);
                    }}>
                    <img src={status.icon} className="mr-2 h-4 w-4 shrink-0" alt={status.label} />
                    <span>{status.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
