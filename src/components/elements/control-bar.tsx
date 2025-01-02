'use client';

import * as React from 'react';
import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

/* filter zone */
interface FilterProps extends React.HTMLAttributes<HTMLDivElement> {
  onDateChange?: (dateRange: { from: string; to?: string } | undefined) => void;
}

export function Filter({ className, onDateChange }: FilterProps) {
  const [date, setDate] = React.useState<DateRange | undefined>();
  const handleApply = () => {
    if (onDateChange && date?.from) {
      const formattedDateRange = {
        from: date.from.toISOString(),
        to: date.to ? date.to.toISOString() : undefined,
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
              <span>Pick a date</span>
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
              onClick={() => setDate(undefined)}
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

/* sort button zone */
export function SortButton() {
  return (
    <div>
      <Select>
        <SelectTrigger className="w-[200px] font-BaiJamjuree text-brown border-[#6b5c56] outline-none focus:ring-none ring-offset-transparent focus:ring-offset-transparent ">
          <SelectValue placeholder="Sort By: Start Date" />
        </SelectTrigger>
        <SelectContent className="font-BaiJamjuree text-brown">
          <SelectItem value="Start Date">Sort by: Start date</SelectItem>
          <SelectItem value="End Date">Sort by: End date</SelectItem>
          <SelectItem value="Highest">Sort by: Highest budget</SelectItem>
          <SelectItem value="Lowest">Sort by: Lowest budget</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/* search bar zone */
export function Searchbar() {
  return (
    <div className="flex flex-1 min-w-[300px] rounded-[6px] border-[1px] w-full h-[40px] px-4 border-brown bg-white items-center gap-2">
      <Search className="text-brown" />
      <input
        type="text"
        placeholder="Search the project.."
        className="resize-none w-full max-w-[575px] h-[40px] outline-none placeholder-gray-300 text-sm font-BaiJamjuree bg-transparent"
      />
    </div>
  );
}

/* new project zone */
export function Createproject() {
  return (
    <div>
      <a href="/projectdetail">
        <Button
          variant="outline"
          className="flex items-center text-[#6b5c56] border-[#6b5c56] px-3 py-1 rounded-md font-BaiJamjuree">
          + New Project
        </Button>
      </a>
    </div>
  );
}
