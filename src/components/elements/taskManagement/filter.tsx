import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import type { TaskProps, TagProps, FilterTasks } from '@/app/types/types';

interface FilterProps {
  tasks: TaskProps[];
  allTags: TagProps[];
  setShowTasks: (prev: TaskProps[]) => void;
}

export const Filter = ({ tasks, allTags, setShowTasks }: FilterProps) => {
  const [filters, setFilters] = useState<FilterTasks>({
    searchTerm: '',
    category: [],
    // ... add the relevant keys to match your data object
    sort: 'stDate_asc',
  });
  // useEffect(() => {
  //   const data = sortAndFilterData(tasks,filters); // call the `sortAndFilterData`function and set its returned value to `filteredData`
  //   setShowTasks(data);
  // }, [filters])
  const sortAndFilterData = (tasks: TaskProps[], filterObj: FilterTasks) => {
    return tasks
      .filter((item) => {
        item.tags?.filter((tag) => {
          tag.id &&
            tag.id.toLowerCase().indexOf(filterObj.searchTerm.toLowerCase()) > -1 &&
            (filterObj.category.length > 0 ? filterObj.category.includes(tag) : true);
        });
      })
      .sort((a: TaskProps, b: TaskProps) => {
        // first, get the name parameter
        const aStDate = a.startDate.valueOf();
        const bStDate = b.startDate.valueOf();
        const aEndDate = a.endDate.valueOf();
        const bEndDate = b.endDate.valueOf();

        switch (filterObj.sort) {
          case 'stDate_asc':
            return aStDate - bStDate;
          case 'stDate_desc':
            return bStDate - aStDate;
          case 'endDate_asc':
            return aEndDate - bEndDate;
          case 'endDate_desc':
            return aEndDate - bEndDate;
          default:
            return 1; // Do nothing if the value is not recognized
        }
      });
  };
  const handleFilter = async (tagID: string) => {
    // setFilters()
    const data = sortAndFilterData(tasks, { searchTerm: tagID, category: [], sort: 'stDate_asc' });
    setShowTasks(data);

    // const filterByTag = async (tasks: TaskProps[], tag: TagProps): Promise<TaskProps[]> => {
    //   const filteredTasks: TaskProps[] = [];

    //   // Iterate through all tasks
    //   for (const task of tasks) {
    //     // Check if the task itself has the matching tag
    //     if (task.tags?.some((item) => item.id === tag.id)) {
    //       filteredTasks.push(task);
    //     }

    //     // If the task has subtasks, recursively filter them
    //     else if (task.subtasks && task.subtasks?.length > 0) {
    //       const subtaskResults = await filterByTag(task.subtasks, tag);
    //       filteredTasks.push(...subtaskResults); // Append the results
    //     }
    //   }

    //   return filteredTasks;
    // };

    // const tag = allTags.find((tag) => tag.id === tagID) || {
    //   id: 'all',
    //   name: 'Default',
    // };

    // if (tag.id === 'all') {
    //   setShowTasks(tasks);
    //   return;
    // }
    // // Call the recursive function and update the state
    // const tasksWithTag = await filterByTag(tasks, tag);
    // setShowTasks(tasksWithTag);
  };

  return (
    <Select
      onValueChange={(value) => {
        handleFilter(value);
      }}>
      <SelectTrigger className="w-[150px] border-brown">
        <SelectValue className="text-brown" placeholder="Filter by: Tag" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem key="default" value="all" className="font-BaiJamjuree">
          Default
        </SelectItem>
        {allTags.map((tag: TagProps) => (
          <SelectItem key={tag.id} value={tag.id} className="font-BaiJamjuree">
            {tag.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
