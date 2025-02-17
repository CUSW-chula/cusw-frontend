'use client';

import * as React from 'react';
import { format, parse, isValid, addDays, set, formatDate } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import BASE_URL, { BASE_SOCKET, type TaskManageMentProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';

// FUNCTION USING INSTRUCTION
//================================================================
// ** Every function must consist with element in DateInterface **
//----------------------------------------------------------------
// DatePickerWithRange Function: JSX => For date range picker in Task.
// DatePickerWithRangeProject Function: JSX => For date range picker in Project
// DateText Function: JSX => For date showing interface. Showing in format DD/MM/YY -> DD/MM/YY and sent "" if date is null

export interface DateInterface {
  id: string;
  startDate: Date | null;
  endDate: Date | null;
}

// Exporting for Task Page
function DatePickerWithRange({ task }: { task: DateInterface }) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [formattedDate, setFormattedDate] = React.useState<string>('');
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  // Regex for date matching
  // const dateTimeRegEx = /^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})$/;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const parseJsonValue = React.useCallback((values: any) => {
    const newValue: DateInterface = {
      id: values.id,
      startDate: values.startDate,
      endDate: values.endDate,
    };
    return newValue;
  }, []);

  // Format date for showing inside popover
  const formatDate = React.useCallback((dateRange: DateRange): string => {
    if (!dateRange.from) return 'Pick a date';

    try {
      const fromFormatted = BuddhistGregor(dateRange.from);
      if (!dateRange.to) return fromFormatted;

      const toFormatted = BuddhistGregor(dateRange.to);
      return `${fromFormatted} - ${toFormatted}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }, []);

  // Initialize dates from task props
  React.useEffect(() => {
    if (!task) return;

    const initializeDates = () => {
      try {
        const from = task.startDate ? new Date(task.startDate) : undefined;
        const to = task.endDate ? new Date(task.endDate) : undefined;

        // Validate dates before setting
        if (from && Number.isNaN(from.getTime())) throw new Error('Invalid start date');
        if (to && Number.isNaN(to.getTime())) throw new Error('Invalid end date');

        const newDateRange = { from, to };
        setDate(newDateRange);
        setFormattedDate(formatDate(newDateRange));
      } catch (error) {
        console.error('Error initializing dates:', error);
        setDate({ from: undefined, to: undefined });
        setFormattedDate('Pick a date');
      }
    };

    initializeDates();
  }, [task, formatDate]);

  // WebSocket connection and handling
  React.useEffect(() => {
    const ws = new WebSocket(BASE_SOCKET);

    ws.onmessage = async (event) => {
      try {
        const socketEvent = JSON.parse(event.data);
        if (socketEvent.eventName !== 'date') return;

        const parsedData = parseJsonValue(socketEvent.data);
        const newDateRange = {
          from: parsedData.startDate ?? undefined,
          to: parsedData.endDate ?? undefined,
        };

        setDate(newDateRange);
        setFormattedDate(formatDate(newDateRange));
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    };

    return () => ws.close();
  }, [parseJsonValue, formatDate]);

  // Handle calendar selection
  const handleCalendarSelect = async (range: DateRange | undefined) => {
    // Patch input to database.
    const url = `${BASE_URL}/v2/tasks/date`;
    const options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      // body: `{"taskID":"${task_id}", "startDate":"${range?.from}", "endDate":"${range?.to}"}`
      body: JSON.stringify({
        taskID: task.id,
        startDate: range?.from ? range.from : null,
        endDate: range?.to ? range.to : null,
      }),
    };
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (data) {
        setDate(range);
        setFormattedDate(formatDate(range ?? { from: undefined, to: undefined }));
      }
      // console.log(data); // Check Fetch Data
    } catch (error) {
      console.error(error);
    }

    //Show data in range
    console.log('range from selected date:', range);
  };

  const formatBuddhistCaption = (date: Date) => {
    const year = date.getFullYear() + 543; // Convert to Buddhist year
    const month = date.getMonth() + 1; // Months are 0-indexed
    return `${month} ${year}`; // Format as 'Month Year'
  };

  return (
    <div className={cn('grid gap-2')}>
      <Popover>
        <PopoverTrigger asChild className="border-brown text-brown">
          <Button
            id="date"
            variant={'outline'}
            className={cn('justify-start text-left font-small', !date && 'text-muted-foreground')}>
            {date?.from ? (
              date.to ? (
                <>{formattedDate}</>
              ) : (
                <>{formattedDate}</>
              )
            ) : (
              <>
                <span className="text-brown">{formattedDate}</span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z -1  " align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            formatters={{
              formatCaption: (date: Date) => {
                const engMonth = date.toLocaleString('en-US', { month: 'long' });
                const buddhistYear = date.getFullYear() + 543;
                return `${engMonth} ${buddhistYear}`;
              },
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Exporting for Project Page.
function DatePickerWithRangeProject({ project }: { project: DateInterface }) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [formattedDate, setFormattedDate] = React.useState<string>('');
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  // Regex for date matching
  // const dateTimeRegEx = /^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})$/;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const parseJsonValue = React.useCallback((values: any) => {
    const newValue: DateInterface = {
      id: values.id,
      startDate: values.startDate,
      endDate: values.endDate,
    };
    return newValue;
  }, []);

  const formatDate = React.useCallback((dateRange: DateRange): string => {
    if (!dateRange.from) return 'Pick a date';

    try {
      const fromFormatted = BuddhistGregor(dateRange.from);
      if (!dateRange.to) return fromFormatted;

      const toFormatted = BuddhistGregor(dateRange.to);
      return `${fromFormatted} - ${toFormatted}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }, []);

  // Initialize dates from task props
  React.useEffect(() => {
    if (!project) return;

    const initializeDates = () => {
      try {
        const from = project.startDate ? new Date(project.startDate) : undefined;
        const to = project.endDate ? new Date(project.endDate) : undefined;

        // Validate dates before setting
        if (from && Number.isNaN(from.getTime())) throw new Error('Invalid start date');
        if (to && Number.isNaN(to.getTime())) throw new Error('Invalid end date');

        const newDateRange = { from, to };
        setDate(newDateRange);
        setFormattedDate(formatDate(newDateRange));
      } catch (error) {
        console.error('Error initializing dates:', error);
        setDate({ from: undefined, to: undefined });
        setFormattedDate('Pick a date');
      }
    };

    initializeDates();
  }, [project, formatDate]);

  // WebSocket connection and handling
  React.useEffect(() => {
    const ws = new WebSocket(BASE_SOCKET);

    ws.onmessage = async (event) => {
      try {
        const socketEvent = JSON.parse(event.data);
        if (socketEvent.eventName !== 'project') return;

        const parsedData = parseJsonValue(socketEvent.data);
        const newDateRange = {
          from: parsedData.startDate ?? undefined,
          to: parsedData.endDate ?? undefined,
        };

        setDate(newDateRange);
        setFormattedDate(formatDate(newDateRange));
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    };

    return () => ws.close();
  }, [parseJsonValue, formatDate]);

  // Handle calendar selection
  const handleCalendarSelect = async (range: DateRange | undefined) => {
    // Patch input to database.
    const url = `${BASE_URL}/v2/projects/${project.id}`;
    const options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      // body: `{"taskID":"${task_id}", "startDate":"${range?.from}", "endDate":"${range?.to}"}`
      body: JSON.stringify({
        projectID: project.id,
        startDate: range?.from ? range.from : null,
        endDate: range?.to ? range.to : null,
      }),
    };
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (data) {
        setDate(range);
        setFormattedDate(formatDate(range ?? { from: undefined, to: undefined }));
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
      <Popover>
        <PopoverTrigger asChild className="border-brown text-brown">
          <Button
            id="date"
            variant={'outline'}
            className={cn('justify-start text-left font-small', !date && 'text-muted-foreground')}>
            {date?.from ? (
              date.to ? (
                <>{formattedDate}</>
              ) : (
                <>{formattedDate}</>
              )
            ) : (
              <>
                <span className="text-brown">{formattedDate}</span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z -1  " align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            formatters={{
              // Format Calendar header to buddhist year
              formatCaption: (date: Date) => {
                const engMonth = date.toLocaleString('en-US', { month: 'long' });
                const buddhistYear = date.getFullYear() + 543;
                return `${engMonth} ${buddhistYear}`;
              },
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Format date to buddhist gregory's calendar
function BuddhistGregor(date: Date | null): string {
  const formatDate = (date: Date | null): string => {
    // Check if date is null or not a valid Date object
    if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) {
      return '';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear() + 543; // Add to buddhist year
    return `${day}/${month}/${year}`;
  };

  return formatDate(date);
}

// Sending format text for showing in Task Management and Project page.
function DateText({ date }: { date: DateInterface }) {
  const formatDate = (date: DateInterface): string => {
    console.log('Type of date:', typeof date, date);
    // Return an empty string if both dates are not provided
    if (!date) return '';

    const format = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear() + 543;
      return `${day}/${month}/${year}`;
    };

    // Format startdate and enddate if they are valid
    const start = date.startDate ? format(date.startDate) : '';
    const end = date.endDate ? format(date.endDate) : '';
    return `${start}${start && end ? ' -> ' : ''}${end}`;
  };

  return <div>{formatDate(date)}</div>;
}

export { DatePickerWithRange, DatePickerWithRangeProject, DateText };
