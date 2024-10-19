'use client';

import * as React from 'react';
import unassigned from '../../asset/icon/unassigned.svg';
import assigned from '../../asset/icon/assigned.svg';
import inreview from '../../asset/icon/inreview.svg';
import inrecheck from '../../asset/icon/inrecheck.svg';
import done from '../../asset/icon/done.svg';

import { CheckCircle2, Circle, LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Status {
  value: string;
  label: string;
  icon: React.ElementType;
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

export function ComboboxPopover() {
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status>();

  return (
    <div className="flex items-center">
      <Circle className="text-gray-400" />
      <p className="text-sm text-muted-foreground ml-2 mr-4">Status:</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-[150px] justify-start font-BaiJamjuree">
            {selectedStatus ? (
              <>
                <selectedStatus.icon className="mr-2 h-4 w-4 shrink-0" />
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
                    onSelect={(value) => {
                      //setSelectedStatus(
                      //)
                      setOpen(false);
                      console.log(value);
                    }}>
                    {/* <img src={status.icon} alt="icon" /> */}
                    {/* { <status.icon
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                status.value === selectedStatus?.value
                                                    ? "opacity-100"
                                                    : "opacity-40"
                                            )}
                                        />
                                         } */}
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
