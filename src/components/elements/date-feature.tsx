'use client';

import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

export function DatePickerWithRange() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
  });
  const [inputValue, setInputValue] = React.useState<string>('');

  // Handle input changes and update calendar state based on the input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Try to parse the date from the input
    const [fromStr, toStr] = value.split(' - ').map((dateStr) => dateStr.trim());

    const from = parse(fromStr, 'MM/dd/yyyy', new Date());
    const to = parse(toStr, 'MM/dd/yyyy', new Date());

    if (isValid(from) && isValid(to)) {
      setDate({ from, to });
    } else if (isValid(from)) {
      setDate({ from, to: undefined });
    }
  };

  // Handle calendar selection
  const handleCalendarSelect = (range: DateRange | undefined) => {
    setDate(range);

    if (range?.from) {
      setInputValue(
        range.to
          ? `${format(range.from, 'MM/dd/yyyy')} - ${format(range.to, 'MM/dd/yyyy')}`
          : format(range.from, 'MM/dd/yyyy')
      );
    } else {
      setInputValue('');
    }
  };

  return (
    <div className={cn('grid gap-2')}>
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder="MM/DD/YYYY - MM/DD/YYYY"
              className="w-[300px] pl-10" // Add padding for the icon
            />
            <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleCalendarSelect}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
