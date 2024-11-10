'use client';

import * as React from 'react';
import { format, parse, isValid, addDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

function DatePickerWithRange() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
  });
  const [inputValue, setInputValue] = React.useState<string>('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Regex for date matching
  const dateTimeRegEx = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;

  // Handle input changes and update calendar state based on the input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Split from and to date
    const [fromStr, toStr] = value.split(' - ').map((dateStr) => dateStr.trim());

    // Parse date from string
    const from =
      fromStr && dateTimeRegEx.test(fromStr) ? parse(fromStr, 'dd/MM/yyyy', new Date()) : undefined;
    const to =
      toStr && dateTimeRegEx.test(toStr) ? parse(toStr, 'dd/MM/yyyy', new Date()) : undefined;

    // Check state in varaible: console.log(value + "\n" + fromStr + " " + toStr + "\n" + from + " " + to);

    if (isValid(from) && isValid(to)) {
      setDate({ from, to });
    } else if (isValid(from)) {
      setDate({ from, to });
    }
  };

  // Handle calendar selection
  const handleCalendarSelect = (range: DateRange | undefined) => {
    setDate(range);

    if (range?.from) {
      setInputValue(
        range.to
          ? `${format(range.from, 'MM/dd/yyyy')} - ${format(range.to, 'MM/dd/yyyy')}`
          : format(range.from, 'MM/dd/yyyy'),
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
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="DD/MM/YYYY - DD/MM/YYYY"
              className="w-[300px] pl-10" // Add padding for the icon
            />
            <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z -1" align="start">
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

export { DatePickerWithRange };
