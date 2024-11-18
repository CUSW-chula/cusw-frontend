'use client';

import * as React from 'react';
import { format, parse, isValid, addDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import BASE_URL, { BASE_SOCKET, type TaskManageMentProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';

interface DateInterface {
  id: string;
  startDate: Date | null;
  endDate: Date | null;
}

function DatePickerWithRange({ task_id }: TaskManageMentProp) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
  });
  const [inputValue, setInputValue] = React.useState<string>('');
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  // Regex for date matching
  const dateTimeRegEx = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const parseJsonValue = React.useCallback((values: any) => {
    const newValue: DateInterface = {
      id: values.id,
      startDate: values.startDate,
      endDate: values.endDate,
    };
    return newValue;
  }, []);

  React.useEffect(() => {
    // Fetch Data
    const fetchDate = async () => {
      const curDate = await fetch(`${BASE_URL}/tasks/getdate/${task_id}`, {
        headers: {
          Authorization: auth,
        },
      });
      console.log(curDate);
    };

    fetchDate();

    const ws = new WebSocket(BASE_SOCKET);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = async (event) => {
      console.log('Message received:', event.data);

      try {
        const url = `${BASE_URL}/tasks/date`;
        const options = {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: auth },
          body: JSON.stringify({ taskId: task_id, startDate: date?.from, endDate: date?.to }),
        };

        try {
          await fetch(url, options);
        } catch (error) {
          console.error(error);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, [date, task_id, auth]);

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