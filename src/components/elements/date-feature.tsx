'use client';

import * as React from 'react';
import { format, parse, isValid, addDays, set, formatDate } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar2';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import BASE_URL, { BASE_SOCKET, Project, type TaskManageMentProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { transform } from 'next/dist/build/swc/generated-native';
import { toast } from '@/hooks/use-toast';
import { getUserRoleOnProjectTask } from '@/service/userService';
import { useEffect, useState } from 'react';
import type { TaskProps } from '@/app/types/types';
import { can } from '@/permissions/helper';

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
  projectId?: string; // เพิ่ม projectId สำหรับ task
  parentTaskId?: string; // เพิ่ม parentTaskId สำหรับ subtask
}

// Exporting for Task Page
function DatePickerWithRange({ task }: { task: TaskProps }) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [formattedDate, setFormattedDate] = React.useState<string>('');
  const [isRangeComplete, setIsRangeComplete] = React.useState(false);
  const [projectBounds, setProjectBounds] = React.useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [parentTaskBounds, setParentTaskBounds] = React.useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const clickCountRef = React.useRef(0);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  // ตรวจสอบว่า task นี้เป็น subtask หรือไม่
  const isSubtask = task.parentTaskId && task.parentTaskId.trim() !== '';

  // ดึงข้อมูล project เพื่อตรวจสอบขอบเขตวันที่
  React.useEffect(() => {
    const fetchProjectBounds = async () => {
      if (!task.projectId) return;

      try {
        const response = await fetch(`${BASE_URL}/v2/projects/${task.projectId}`, {
          headers: { Authorization: auth },
        });
        const project = await response.json();
        setProjectBounds({
          startDate: project.startDate ? new Date(project.startDate) : null,
          endDate: project.endDate ? new Date(project.endDate) : null,
        });
      } catch (error) {
        console.error('Error fetching project bounds:', error);
      }
    };

    fetchProjectBounds();
  }, [task.projectId, auth]);

  // ดึงข้อมูล parent task เพื่อตรวจสอบขอบเขตวันที่ (สำหรับ subtask)
  React.useEffect(() => {
    const fetchParentTaskBounds = async () => {
      if (!isSubtask) return;

      try {
        const response = await fetch(`${BASE_URL}/v2/tasks/${task.parentTaskId}`, {
          headers: { Authorization: auth },
        });
        const parentTask = await response.json();
        setParentTaskBounds({
          startDate: parentTask.startDate ? new Date(parentTask.startDate) : null,
          endDate: parentTask.endDate ? new Date(parentTask.endDate) : null,
        });
      } catch (error) {
        console.error('Error fetching parent task bounds:', error);
      }
    };

    fetchParentTaskBounds();
  }, [task.parentTaskId, auth, isSubtask]);

  // ตรวจสอบว่าวันที่อยู่ในขอบเขตที่เหมาะสมหรือไม่
  const isDateWithinBounds = (dateRange: DateRange | undefined): boolean => {
    if (!dateRange?.from) return true;

    const fromDate = dateRange.from;
    const toDate = dateRange.to || dateRange.from;

    // ถ้าเป็น subtask ให้ตรวจสอบขอบเขตของ parent task
    if (isSubtask && parentTaskBounds.startDate && parentTaskBounds.endDate) {
      return (
        fromDate >= parentTaskBounds.startDate &&
        fromDate <= parentTaskBounds.endDate &&
        toDate >= parentTaskBounds.startDate &&
        toDate <= parentTaskBounds.endDate
      );
    }

    // ถ้าเป็น task ปกติ ให้ตรวจสอบขอบเขตของ project
    if (projectBounds.startDate && projectBounds.endDate) {
      return (
        fromDate >= projectBounds.startDate &&
        fromDate <= projectBounds.endDate &&
        toDate >= projectBounds.startDate &&
        toDate <= projectBounds.endDate
      );
    }

    return true;
  };

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
      const fromFormatted = ChristGregor(dateRange.from);
      if (!dateRange.to) return fromFormatted;

      const toFormatted = ChristGregor(dateRange.to);
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
        // if (from && Number.isNaN(from.getTime())) throw new Error('Invalid start date');
        // if (to && Number.isNaN(to.getTime())) throw new Error('Invalid end date');
        // ** Comment Since date is nullable variable

        const newDateRange = { from, to };
        setDate(newDateRange);
        setFormattedDate(formatDate(newDateRange));
        // ตั้งค่า isRangeComplete ถ้ามี range ครบ (from และ to ต่างกัน)
        setIsRangeComplete(Boolean(from && to && from.getTime() !== to.getTime()));
      } catch (error) {
        console.error('Error initializing dates:', error);
        setDate({ from: undefined, to: undefined });
        setFormattedDate('Pick a date');
        setIsRangeComplete(false);
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
    let patchedRange = range;

    // ถ้าไม่มี range หรือ from ไม่มีค่า
    if (!range?.from) {
      return;
    }

    // ตรวจสอบขอบเขตก่อนดำเนินการ
    if (!isDateWithinBounds(range)) {
      toast({
        title: 'วันที่ไม่ถูกต้อง',
        description: isSubtask
          ? 'ไม่สามารถสร้างวันที่นอก parent task'
          : 'วันที่ที่เลือกต้องอยู่ภายในช่วงวันที่ของโปรเจค',
        variant: 'default',
      });
      return;
    }

    // ถ้าเลือกวันเดียว (from มีค่า แต่ to ยังไม่มี) ให้ to = from
    if (range?.from && !range?.to) {
      patchedRange = { from: range.from, to: range.from };
    }

    const url = `${BASE_URL}/v2/tasks/date/${task.id}`;
    const options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({
        startDate: patchedRange?.from ? patchedRange.from : null,
        endDate: patchedRange?.to ? patchedRange.to : null,
      }),
    };
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (data) {
        setDate(patchedRange);
        setFormattedDate(formatDate(patchedRange ?? { from: undefined, to: undefined }));
      }
    } catch (error) {
      console.error(error);
    }
    console.log('range from selected date:', patchedRange);
  };

  const [hasEditPermission, setHasEditPermission] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const { projectRole, taskRole, isAdmin, isHead } = await getUserRoleOnProjectTask({
        projectId: task.projectId,
        taskId: task.id,
      });
      setHasEditPermission(can('editDate', { projectRole, taskRole, isAdmin, isHead }));
    };

    checkPermission();
  }, [task.projectId, task.id]);
  return (
    <div className={cn('grid gap-2')}>
      <Popover>
        <PopoverTrigger asChild className="border-brown h-8 px-2" disabled={!hasEditPermission}>
          <Button
            id="date"
            variant={'outline'}
            className={`font-BaiJamjuree text-sm text-brown' ${date && 'text-muted-foreground'}`}>
            {date?.from ? (
              date.to ? (
                <>{formattedDate}</>
              ) : (
                <>{formattedDate}</>
              )
            ) : (
              <>
                <span className="text-brown text-sm font-BaiJamjuree">{formattedDate}</span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-1 p-ui" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
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
  const clickCountRef = React.useRef(0);
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

  const formatDate = React.useCallback((dateRange: DateRange | undefined): string => {
    if (dateRange === undefined) return 'Pick a date';
    if (!dateRange.from) return 'Pick a date';

    try {
      const fromFormatted = ChristGregor(dateRange.from);
      if (!dateRange.to) return fromFormatted;

      const toFormatted = ChristGregor(dateRange.to);
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
        // if (from && Number.isNaN(from.getTime())) throw new Error('Invalid start date');
        // if (to && Number.isNaN(to.getTime())) throw new Error('Invalid end date');

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

  // Handle calendar selection (เหมือน date feature)
  const handleCalendarSelect = async (range: DateRange | undefined) => {
    if (!range?.from) return; // เพิ่มการตรวจสอบ isMember

    let patchedRange = range;
    // Logic: กดครั้งแรกให้ start/end เป็นวันเดียวกัน, กดครั้งที่สองถึงจะเป็น range
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

    const url = `${BASE_URL}/v2/projects/${project.id}`;
    const options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({
        projectID: project.id,
        startDate: patchedRange?.from ? patchedRange.from : null,
        endDate: patchedRange?.to ? patchedRange.to : null,
      }),
    };
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (data) {
        setDate(patchedRange);
        setFormattedDate(formatDate(patchedRange));
      }
    } catch (error) {
      console.error(error);
    }
    console.log('range from selected date:', patchedRange);
  };

  const [open, setOpen] = React.useState(false);
  const handlePopoverOpenChange = (newOpen: boolean) => {
    if (hasEditPermission) {
      // ใช้ default behavior ของ Popover
    }
  };
  const handleButtonClick = () => {
    if (!hasEditPermission) {
      // ป้องกันการเปิด popover
      return false;
    }
  };

  const [hasEditPermission, setHasEditPermission] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const { projectRole, taskRole, isAdmin, isHead } = await getUserRoleOnProjectTask({
        projectId: project.id,
      });
      setHasEditPermission(can('editProjectDate', { projectRole, taskRole, isAdmin, isHead }));
    };

    checkPermission();
  }, [project.id]);

  return (
    <div className={cn('grid gap-2')}>
      <Popover onOpenChange={handlePopoverOpenChange}>
        <PopoverTrigger asChild className="border-brown h-8 px-2" disabled={!hasEditPermission}>
          <Button
            id="date"
            variant="outline"
            className={cn(
              `font-BaiJamjuree text-sm text-brown hover:bg-gray-50 ${!date && 'text-muted-foreground'}`,
            )}
            onClick={handleButtonClick}>
            {date?.from ? (
              date.to ? (
                <>{formattedDate}</>
              ) : (
                <>{formattedDate}</>
              )
            ) : (
              <>
                <span className="p-ui text-sm">{formattedDate}</span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-1 p-ui" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Format date to buddhist gregory's calendar
function ChristGregor(date: Date | null): string {
  const formatDate = (date: Date | null): string => {
    // Check if date is null or not a valid Date object
    const formatted = date ? new Date(date) : null;
    if (!formatted) {
      console.log('date is error::\n', date, typeof date);
      return '';
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    };

    return formatted.toLocaleDateString('en-US', options);
  };

  return formatDate(date);
}

// Sending format text for showing in Task Management and Project page.
function DateText(date: DateInterface): string {
  const formatDate = (date: DateInterface): string => {
    // Return an empty string if both dates are not provided
    if (!date) return '';

    const format = (date: Date | null): string => {
      const formatted = date ? new Date(date) : null;
      if (!(formatted instanceof Date)) return '';

      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      };

      return formatted.toLocaleDateString('en-US', options);
    };

    // Format startdate and enddate if they are valid
    const start = date.startDate ? format(date.startDate) : '';
    const end = date.endDate ? format(date.endDate) : '';
    return `${start}${start && end ? ' - ' : ''}${end}`;
  };

  return formatDate(date);
}

// Check if date is valid or not to check on showing format
// **
// function isValidDate(date: Date | null): boolean {
//   console.log("Date: ", date)
//   if (!date) return false;
//   const isValid = (date: Date | null): boolean => {
//     console.log(`Instance: ${date instanceof Date}, Is: ${typeof date}`)
//     return date instanceof Date && !isNaN(date.getTime()) && date.getFullYear() > 1970;
//   }

//   console.log("Valid?: ", isValid(date));

//   return isValid(date);
// }

export { DatePickerWithRange, DatePickerWithRangeProject, DateText };
