'use client';

import type * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;
function AutoWidthSelect({
  value,
  options,
  onChange,
  className = '',
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  className?: string;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: value triggers width recalculation when content changes
  useEffect(() => {
    if (spanRef.current) {
      setWidth(spanRef.current.offsetWidth);
    }
  }, [value]);

  return (
    <div className="relative inline-block">
      {/* Select box */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-8 text-sm bg-transparent shadow-sm text-black appearance-none has-focus:border-ring border-input has-focus:ring-ring/50 relative flex rounded-[8px] border shadow-xs has-focus:ring-[3px] px-2 pr-6 focus:outline-none focus:ring-0 cursor-pointer font-semibold ${className}`}
        style={{ width: width + 20 }}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {/* Chevron icon */}
      <ChevronDownIcon className="absolute right-1 top-1/2 -translate-y-1/2 size-[14px] pointer-events-none" />

      {/* Hidden span to measure selected width */}
      <span ref={spanRef} className="invisible absolute whitespace-nowrap text-sm font-normal px-2">
        {value}
      </span>
    </div>
  );
}

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const years = Array.from({ length: 50 }, (_, i) => today.getFullYear() - 25 + i);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(months.indexOf(month));
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(Number.parseInt(year));
  };

  return (
    <div className="p-3">
      <div className="flex justify-end mb-1 gap-2">
        <AutoWidthSelect
          value={months[selectedMonth]}
          options={months}
          onChange={(month) => handleMonthChange(month)}
        />
        <AutoWidthSelect
          value={selectedYear.toString()}
          options={years.map(String)}
          onChange={(yearStr) => handleYearChange(yearStr)}
        />
      </div>

      <DayPicker
        showOutsideDays={showOutsideDays}
        month={new Date(selectedYear, selectedMonth)} // ✅ ใช้ `month` เพื่อเปลี่ยนเดือน
        onMonthChange={(date) => {
          setSelectedMonth(date.getMonth());
          setSelectedYear(date.getFullYear());
        }}
        className={cn('', className)}
        classNames={{
          months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
          month: 'space-y-4',
          caption: 'flex justify-center pt-1 relative items-center text-black',
          caption_label: 'text-sm font-medium',
          nav: 'space-x-1 flex items-center',
          nav_button: cn(
            buttonVariants({ variant: 'outline' }),
            'h-7 w-7 bg-transparent p-0 border-none',
          ),
          nav_button_previous: 'absolute left-1',
          nav_button_next: 'absolute right-1',
          table: 'w-full border-collapse ',
          head_row: 'flex',
          head_cell:
            'text-neutral-500 rounded-md w-8 font-normal text-[0.8rem] dark:text-neutral-400',
          row: 'flex w-full mt-2',
          cell: 'h-8 w-8 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-100/50 [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 dark:[&:has([aria-selected].day-outside)]:bg-neutral-800/50 dark:[&:has([aria-selected])]:bg-neutral-800',
          day: cn(
            buttonVariants({ variant: 'ghost' }),
            'h-8 w-8 p-0 aria-selected:opacity-100 text-black',
          ),
          day_range_end: 'day-range-end',
          day_selected:
            'bg-neutral-900 text-neutral-50 hover:bg-neutral-900 hover:text-neutral-50 focus:bg-neutral-900 focus:text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50 dark:hover:text-neutral-900 dark:focus:bg-neutral-50 dark:focus:text-neutral-900',
          day_today: 'bg-slate-100 text-neutral-900 dark:bg-slate-100 dark:text-neutral-50',
          day_outside:
            'day-outside text-neutral-500 aria-selected:bg-slate-100/50 aria-selected:text-neutral-500 dark:text-neutral-400 dark:aria-selected:bg-neutral-800/50 dark:aria-selected:text-neutral-400',
          day_disabled: 'text-neutral-500 opacity-50 dark:text-neutral-400',
          day_range_middle:
            'aria-selected:bg-slate-100 aria-selected:text-neutral-900 dark:aria-selected:bg-neutral-800 dark:aria-selected:text-neutral-50',
          day_hidden: 'invisible',
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
    </div>
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
