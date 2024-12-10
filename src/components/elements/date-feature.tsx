'use client';

import * as React from 'react';
import { format, parse, isValid, addDays, set, formatDate } from 'date-fns';
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
    to: new Date(),
  });
  const [inputValue, setInputValue] = React.useState<string>('');
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  // Regex for date matching
  const dateTimeRegEx = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const dateTimeRegEx2 = /^(\d{4})-(\d{2})-(\d{2})/;

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
      const curDate = await fetch(`${BASE_URL}/tasks/date/${task_id}`, {
        headers: {
          Authorization: auth,
        },
      });
      const initDate = await curDate.json();
      const from = initDate[0];
      const to = initDate[1];
      setDate({ from, to });
    };

    fetchDate();

    const ws = new WebSocket(BASE_SOCKET);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = async (event) => {
      console.log('Message received:', event.data);

      try {
        // Connect web socket
        const socketEvent = JSON.parse(event.data);
        const eventName = socketEvent.eventName;
        const data = parseJsonValue(socketEvent.data);
        if (eventName === 'date') {
          const start = data.startDate?.toString();
          const end = data.endDate?.toString();
          console.log('start and type:', start, typeof start);
          console.log('end and type:', end, typeof end);
          const from = start ? new Date(start) : undefined;
          const to = end ? new Date(end) : undefined;
          setDate({ from, to });
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
  }, [parseJsonValue, task_id, auth]);

  // useEffect to handle inputValue when date change
  React.useEffect(() => {
    if (date?.from) {
      setInputValue(
        date.to
          ? `${format(date.from, 'dd/MM/yyyy')} - ${format(date.to, 'dd/MM/yyyy')}`
          : inputValue.length > format(date.from, 'dd/MM/yyyy').length
            ? inputValue
            : format(date.from, 'dd/MM/yyyy'),
      );
    } else {
      setInputValue(inputValue);
    }
  }, [date, inputValue]);

  // Handle input changes and update calendar state based on the input
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // console.log('input value:', value)
    await setInputValue(value);

    // Split from and to date
    const [fromStr, toStr] = await value.split('- ').map((dateStr) => dateStr.trim());

    // Parse date from string
    const from =
      (await fromStr) && dateTimeRegEx.test(fromStr)
        ? parse(fromStr, 'dd/MM/yyyy', new Date())
        : undefined;
    const to =
      (await toStr) && dateTimeRegEx.test(toStr)
        ? parse(toStr, 'dd/MM/yyyy', new Date())
        : undefined;

    // Check state in varaible:
    // console.log(value + "\n" + fromStr + " " + toStr + "\n" + from + " " + to + "\n");
    // console.log('Cur input value:', inputValue);

    const url = `${BASE_URL}/tasks/date`;
    const options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      // body: `{"taskID":"${task_id}", "startDate":"${range?.from}", "endDate":"${range?.to}"}`
      body: JSON.stringify({
        taskID: task_id,
        startDate: from ? from : null,
        endDate: to ? to : null,
      }),
    };
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      // console.log(data); // Check fetch data
    } catch (error) {
      console.error(error);
    }

    if (isValid(from) && isValid(to)) {
      setDate({ from, to });
    } else if (isValid(from)) {
      setDate({ from, to });
    }
  };

  // Handle calendar selection
  const handleCalendarSelect = async (range: DateRange | undefined) => {
    // Patch input to database.
    const url = `${BASE_URL}/tasks/date`;
    const options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      // body: `{"taskID":"${task_id}", "startDate":"${range?.from}", "endDate":"${range?.to}"}`
      body: JSON.stringify({
        taskID: task_id,
        startDate: range?.from ? range.from : null,
        endDate: range?.to ? range.to : null,
      }),
    };
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (data) {
        setDate(range);
      }
      // console.log(data); // Check Fetch Data
    } catch (error) {
      console.error(error);
    }

    //Show data in range
    console.log('range from selected date:', range);
  };

  return (
    <div className={cn('grid gap-2')}>
      <Popover >
        <PopoverTrigger asChild className='border-brown text-brown' >
          <div className="relative">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder="DD/MM/YYYY - DD/MM/YYYY"
              className="w-auto pl-10" // Add padding for the icon
            />
            <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z -1  " align="start">
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
