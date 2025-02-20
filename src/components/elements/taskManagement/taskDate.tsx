import type { TaskProps } from '@/app/types/types';
import { Calendar } from 'lucide-react';
import { DateInterface, DateText } from '../date-feature';

export const TaskDate = ({
  item,
  hiddenDate,
}: {
  item: TaskProps;
  hiddenDate: boolean;
}) => {
  //format Date display
  const formatDate = (startdate: Date | null, enddate: Date | null): string => {
    // Return an empty string if both dates are not provided
    console.log('From task date: ', startdate, enddate);
    console.log('item: ', item);
    if (!startdate || !enddate) return '';

    const format = (date: Date): string => {
      try {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      } catch (error) {
        return '12/12/2012';
      }
    };

    // Format startdate and enddate if they are valid
    const start = startdate ? format(startdate) : '';
    const end = enddate ? format(enddate) : '';

    return `${start}${start && end ? ' -> ' : ''}${end}`;
  };

  return (
    <>
      {(item.startDate || item.endDate) && (
        <div className={`${hiddenDate ? '' : ''} inline-flex gap-1`} title={DateText(item)}>
          <Calendar className="w-6 h-6" />
          <span className={`${hiddenDate ? 'hidden' : 'inline'} whitespace-nowrap`}>
            {DateText(item)}
          </span>
        </div>
      )}
    </>
  );
};
