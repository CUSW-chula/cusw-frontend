import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { TaskProps } from '@/app/types/types';

interface SortProps {
  showTasks: TaskProps[];
  setShowTasks: (prev: TaskProps[]) => void;
}

export const Sort = ({ showTasks, setShowTasks }: SortProps) => {
  const sortItem = [
    {
      value: 'StartDate123',
      label: 'Start date ↓',
    },
    {
      value: 'StartDate321',
      label: 'Start date ↑',
    },
    {
      value: 'EndDate123',
      label: 'End date ↓',
    },
    {
      value: 'EndDate321',
      label: 'End date ↑',
    },
  ];
  const handleSort = (value: string) => {
    const sortTasksByDate = (
      tasks: TaskProps[],
      dateType: 'startDate' | 'endDate',
      inOrder: boolean,
    ): TaskProps[] => {
      return tasks
        .filter((task) => task[dateType] !== null) // Filter out tasks with null dates
        .sort((task1, task2) => {
          const date1 = new Date(task1[dateType]).getTime();
          const date2 = new Date(task2[dateType]).getTime();
          return inOrder ? date1 - date2 : date2 - date1; // Sort in ascending or descending order
        })
        .concat(tasks.filter((task) => task[dateType] === null)); // Add tasks with null dates at the end
    };

    let sortedTasks: TaskProps[];

    switch (value) {
      case 'StartDate123':
        sortedTasks = sortTasksByDate(showTasks, 'startDate', true);
        break;
      case 'StartDate321':
        sortedTasks = sortTasksByDate(showTasks, 'startDate', false);
        break;
      case 'EndDate123':
        sortedTasks = sortTasksByDate(showTasks, 'endDate', true);
        break;
      case 'EndDate321':
        sortedTasks = sortTasksByDate(showTasks, 'endDate', false);
        break;
      default:
        return; // Do nothing if the value is not recognized
    }

    setShowTasks(sortedTasks); // Update the state with sorted tasks
  };
  return (
    <Select onValueChange={(value) => handleSort(value)}>
      <SelectTrigger className="w-[150px] border-brown">
        <SelectValue className="text-brown" placeholder="Sort by: Start date" />
      </SelectTrigger>
      <SelectContent>
        {sortItem.map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            Sort by: {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
