'use client';

import * as React from 'react';
import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon, CheckIcon, Search } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useEffect, useRef, useState } from 'react';
import BASE_URL, { type ProjectTagProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { Separator } from '@/components/ui/separator';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { tagsListAtom } from '@/atom';
interface FilterDateRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  onDateChange?: (dateRange: { from: string; to: string } | undefined) => void;
}

interface SearchProp {
  onSearchChange?: (search: string) => void;
}

interface SortProp {
  onSelectChange?: (value: string) => void;
}
interface FilterTagsProp {
  onSelectTagChange?: (selectedValues: string[]) => void;
}

const cookie = getCookie('auth');
const auth = cookie?.toString() ?? '';

/* filter zone */
export function FilterByDateRange({ className, onDateChange }: FilterDateRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>();
  const handleReset = () => {
    setDate(undefined);
    if (onDateChange) {
      onDateChange(undefined);
    }
  };
  const handleApply = () => {
    if (onDateChange && date?.from && date?.to) {
      const formattedDateRange = {
        from: date.from.toISOString(),
        to: date.to.toISOString(),
      };
      onDateChange(formattedDateRange);
    }
  };
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[240px] justify-start text-left font-BaiJamjuree border-[1px] border-brown',
              !date && 'text-muted-foreground',
            )}>
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Filter by date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex flex-col " align="center">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
          <div className="flex justify-end">
            <Button
              className="m-2 bg-transparent text-brown border-brown hover:text-brown"
              variant={'outline'}
              onClick={handleReset}
              aria-label="Reset the selected date range">
              Reset
            </Button>
            <Button
              className="m-2 bg-brown"
              onClick={handleApply}
              aria-label="Apply the selected date range">
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function FilterByTags({ onSelectTagChange }: FilterTagsProp) {
  const [selectedValues, setSelectedValues] = React.useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [tagsList] = useAtom<ProjectTagProp[]>(tagsListAtom);
  const prevSelectedValues = useRef<string[]>([]);
  useEffect(() => {
    if (JSON.stringify(prevSelectedValues.current) !== JSON.stringify(selectedValues)) {
      // Call onSelectTagChange only when selectedValues change
      if (onSelectTagChange) {
        onSelectTagChange(selectedValues);
      }
      prevSelectedValues.current = selectedValues; // Update ref with the new selectedValues
    }
  }, [selectedValues, onSelectTagChange]);
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setIsPopoverOpen(true);
    } else if (event.key === 'Backspace' && !event.currentTarget.value) {
      const newSelectedValues = [...selectedValues];
      newSelectedValues.pop();
      setSelectedValues(newSelectedValues);
    }
  };

  const toggleOption = (option: string) => {
    const newSelectedValues = selectedValues.includes(option)
      ? selectedValues.filter((value) => value !== option)
      : [...selectedValues, option];
    setSelectedValues(newSelectedValues);
  };

  const handleClear = () => {
    setSelectedValues([]);
  };

  const handleTogglePopover = () => {
    setIsPopoverOpen((prev) => !prev);
  };

  const toggleAll = () => {
    if (selectedValues.length === tagsList.length) {
      handleClear();
    } else {
      const allValues = tagsList.map((option) => option.value);
      setSelectedValues(allValues);
    }
  };
  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          onClick={handleTogglePopover}
          className={cn(
            'flex p-4 rounded-[6px] border border-brown h-10 items-center justify-between  ',
            selectedValues.length !== 0
              ? 'border-red bg-rose-50 hover:bg-rose-50'
              : 'bg-white hover:bg-white',
          )}>
          <span className="text-[14px] text-brown font-BaiJamjuree">
            Filter {selectedValues.length} tag(s)
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        onEscapeKeyDown={() => setIsPopoverOpen(false)}>
        <Command>
          <CommandInput placeholder="Search..." onKeyDown={handleInputKeyDown} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <CommandItem key="all" onSelect={toggleAll} className="cursor-pointer">
                <div
                  className={cn(
                    'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                    selectedValues.length === tagsList.length
                      ? 'bg-primary text-primary-foreground'
                      : 'opacity-50 [&_svg]:invisible',
                  )}>
                  <CheckIcon className="h-4 w-4" />
                </div>
                <span>(Select All)</span>
              </CommandItem>
              {tagsList.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                    className="cursor-pointer">
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}>
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <div className="flex items-center justify-between">
                {selectedValues.length > 0 && (
                  <>
                    <CommandItem
                      onSelect={handleClear}
                      className="flex-1 justify-center cursor-pointer">
                      Clear
                    </CommandItem>
                    <Separator orientation="vertical" className="flex min-h-6 h-full" />
                  </>
                )}
                <CommandItem
                  onSelect={() => setIsPopoverOpen(false)}
                  className="flex-1 justify-center cursor-pointer max-w-full">
                  Close
                </CommandItem>
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/* sort button zone */
export function SortButton({ onSelectChange }: SortProp) {
  const handleSelectChange = (value: string) => {
    if (onSelectChange) {
      onSelectChange(value);
    }
  };
  return (
    <div>
      <Select onValueChange={(value) => handleSelectChange(value)}>
        <SelectTrigger className="w-[200px] font-BaiJamjuree text-brown border-[#6b5c56] outline-none focus:ring-none ring-offset-transparent focus:ring-offset-transparent ">
          <SelectValue placeholder="Sort By: Default" />
        </SelectTrigger>
        <SelectContent className="font-BaiJamjuree text-brown">
          <SelectItem value="Start Date ↑">Sort by: Start date ↑</SelectItem>
          <SelectItem value="Start Date ↓">Sort by: Start date ↓</SelectItem>
          <SelectItem value="End Date ↑">Sort by: End date ↑</SelectItem>
          <SelectItem value="End Date ↓">Sort by: End date ↓</SelectItem>
          <SelectItem value="Highest">Sort by: Highest money</SelectItem>
          <SelectItem value="Lowest">Sort by: Lowest money</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/* search bar zone */
export function Searchbar({ onSearchChange }: SearchProp) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(event.target.value);
    }
  };
  return (
    <div className="flex flex-1 min-w-[300px] rounded-[6px] border-[1px] w-full h-[40px] px-4 border-brown bg-white items-center gap-2">
      <Search className="text-brown" />
      <input
        type="text"
        placeholder="Search the project.."
        className="resize-none w-full h-[40px] outline-none placeholder-gray-300 text-sm font-BaiJamjuree bg-transparent"
        onChange={handleInputChange}
      />
    </div>
  );
}

/* new project zone */
export function Createproject() {
  const router = useRouter();
  const handleCreateProject = async () => {
    const url = `${BASE_URL}/v2/projects`;
    const options = {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
      }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(data);
      if (data?.id) {
        router.push(`/projects/create/${data.id}`);
      } else {
        console.error('Project ID not found', data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleCreateProject}
      className="flex items-center text-[#6b5c56] border-[#6b5c56] px-3 py-1 rounded-md font-BaiJamjuree">
      + New Project
    </Button>
  );
}
