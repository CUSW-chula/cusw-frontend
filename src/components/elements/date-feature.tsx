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
  const [date, setDate] = React.useState<DateRange | undefined>({ from: new Date() });
  const [inputValue, setInputValue] = React.useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [fromStr, toStr] = e.target.value.split(' - ').map((str) => str.trim());
    const from = parse(fromStr, 'MM/dd/yyyy', new Date());
    const to = parse(toStr, 'MM/dd/yyyy', new Date());
    setDate(isValid(from) ? { from, to: isValid(to) ? to : undefined } : undefined);
    setInputValue(e.target.value);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setDate(range);
    setInputValue(
      range?.from
        ? `${format(range.from, 'MM/dd/yyyy')}${range.to ? ` - ${format(range.to, 'MM/dd/yyyy')}` : ''}`
        : '',
    );
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
              className="w-[250px] pl-10"
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
