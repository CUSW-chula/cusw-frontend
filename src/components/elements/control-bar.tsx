'use client';

import * as React from 'react';
import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon, CheckIcon, Plus, Search } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar2';
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
  placeholder: string;
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
  const refCalendar = React.useRef<DateRange | undefined>(date);
  const [isPopover, setIsPopover] = React.useState(false);
  const clickCountRef = React.useRef(0);

  // ปรับ logic การเลือกวันที่
  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (!range?.from) return;
    let patchedRange = range;
    if (clickCountRef.current === 0) {
      // ครั้งแรก: ให้ to = from
      patchedRange = { from: range.from, to: range.from };
      clickCountRef.current = 1;
    } else if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) {
      // ครั้งที่สอง: เป็น range จริง
      patchedRange = { from: range.from, to: range.to };
      clickCountRef.current = 0; // reset เพื่อให้เลือกใหม่ได้
    } else {
      // ถ้าเลือกวันเดียวซ้ำ ให้ to = from
      patchedRange = { from: range.from, to: range.from };
    }
    setDate(patchedRange);
  };

  const handleReset = () => {
    setDate(undefined);
    clickCountRef.current = 0;
    if (onDateChange) {
      onDateChange(undefined);
    }
    setIsPopover(false);
  };
  const handleApply = () => {
    if (onDateChange && date?.from && date?.to) {
      const formattedDateRange = {
        from: date.from.toISOString(),
        to: date.to.toISOString(),
      };
      onDateChange(formattedDateRange);
    } else {
      if (onDateChange) {
        onDateChange(undefined);
      }
    }
    refCalendar.current = date;
    setIsPopover(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsPopover(open);
    if (!open) {
      // ปิดปฏิทิน ให้คืนค่าเดิม
      setDate(refCalendar.current);
      clickCountRef.current = 0;
    }
  };
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isPopover} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[240px] justify-start text-left font-BaiJamjuree border-[1px] border-brown font-bold text-brown text-sm',
              !date && 'text-muted-foreground',
            )}
            onClick={() => setIsPopover(true)}>
            <CalendarIcon className="text-brown" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span className="text-brown text-sm font-normal font-BaiJamjuree">
                Filter by date
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 flex flex-col text-brown text-sm font-normal font-BaiJamjuree"
          align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
          />
          <div className="flex justify-end mb-2 mr-2 gap-2">
            <Button
              className="bg-white h-8 px-2 text-brown border-brown hover:text-brown"
              variant={'outline'}
              onClick={handleReset}
              aria-label="Reset the selected date range">
              Reset
            </Button>
            <Button
              className="bg-brown h-8 px-2"
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
            'flex p-4 rounded-[6px] border h-10 items-center justify-between border-brown',
            selectedValues.length !== 0
              ? ' bg-slate-100 hover:bg-gray-50'
              : 'bg-white hover:bg-white',
          )}>
          <span
            className={`text-sm font-BaiJamjuree ${selectedValues.length !== 0 ? 'text-black font-bold' : 'text-brown font-normal'}`}>
            Filter {selectedValues.length} tag(s)
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 relative"
        align="start"
        onEscapeKeyDown={() => setIsPopoverOpen(false)}>
        <Command>
          <CommandInput placeholder="Search..." onKeyDown={handleInputKeyDown} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="mb-10">
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
            <CommandGroup className="absolute bottom-0 w-full bg-white">
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
export function SelectByTags({ onSelectTagChange }: FilterTagsProp) {
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
            'flex p-4 rounded-[6px] border h-10 items-center justify-between border-brown',
            selectedValues.length !== 0
              ? ' bg-slate-100 hover:bg-gray-50'
              : 'bg-white hover:bg-white',
          )}>
          <span
            className={`text-sm font-BaiJamjuree ${selectedValues.length !== 0 ? 'text-black font-bold' : 'text-brown font-normal'}`}>
            Select {selectedValues.length} tag(s)
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 relative"
        align="start"
        onEscapeKeyDown={() => setIsPopoverOpen(false)}>
        <Command>
          <CommandInput placeholder="Search..." onKeyDown={handleInputKeyDown} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="mb-10">
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
            <CommandGroup className="absolute bottom-0 w-full bg-white">
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
export function SelectByTagsWorkload({ onSelectTagChange }: FilterTagsProp) {
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
            'flex p-4 rounded-[6px] border h-10 items-center justify-between border-brown',
            selectedValues.length !== 0
              ? ' bg-slate-100 hover:bg-gray-50'
              : 'bg-white hover:bg-white',
          )}>
          <span
            className={`text-sm font-BaiJamjuree ${selectedValues.length !== 0 ? 'text-black font-bold' : 'text-brown font-normal'}`}>
            Select {selectedValues.length} tag(s)
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 relative"
        align="start"
        onEscapeKeyDown={() => setIsPopoverOpen(false)}>
        <Command>
          <CommandInput placeholder="Search..." onKeyDown={handleInputKeyDown} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="mb-10">
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
            <CommandGroup className="absolute bottom-0 w-full bg-white">
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
          <SelectValue defaultValue="Default" placeholder="Sort by: Default" />
        </SelectTrigger>
        <SelectContent className="font-BaiJamjuree text-brown">
          <SelectItem value="Default">Sort by: Default </SelectItem>
          <SelectItem value="Start Date ↑">Sort by: Start date ↑</SelectItem>
          <SelectItem value="Start Date ↓">Sort by: Start date ↓</SelectItem>
          <SelectItem value="End Date ↑">Sort by: End date ↑</SelectItem>
          <SelectItem value="End Date ↓">Sort by: End date ↓</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/* search bar zone */
export function Searchbar({ onSearchChange, placeholder }: SearchProp) {
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
        placeholder={placeholder}
        className="resize-none w-full h-[40px] outline-none placeholder-gray-300 text-sm font-BaiJamjuree bg-transparent placeholder:text-[#9a928d] text-brown"
        onChange={handleInputChange}
      />
    </div>
  );
}

/* new project zone */
export function Createproject() {
  const router = useRouter();
  const handleCreateProject = async () => {
    router.push('/projects/create');
  };

  return (
    <Button
      variant="outline"
      onClick={handleCreateProject}
      className="border-brown font-BaiJamjuree text-sm rounded-md gap-1">
      <Plus className="text-brown" />
      <span className="text-brown text-sm font-normal font-BaiJamjuree">New project</span>
    </Button>
  );
}
