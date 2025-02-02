import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { TaskProps, TagProps } from '@/app/types/types';

interface FilterProps {
  tasks: TaskProps[];
  allTags: TagProps[];
  setShowTasks: (prev: TaskProps[]) => void;
}

export const Filter = ({ tasks, allTags, setShowTasks }: FilterProps) => {
  const handleFilter = async (tagID: string) => {
    const filterByTag = async (tasks: TaskProps[], tag: TagProps): Promise<TaskProps[]> => {
      const filteredTasks: TaskProps[] = [];

      // Iterate through all tasks
      for (const task of tasks) {
        // Check if the task itself has the matching tag
        if (task.tags?.some((item) => item.id === tag.id)) {
          filteredTasks.push(task);
        }

        // If the task has subtasks, recursively filter them
        else if (task.subtasks && task.subtasks?.length > 0) {
          const subtaskResults = await filterByTag(task.subtasks, tag);
          filteredTasks.push(...subtaskResults); // Append the results
        }
      }

      return filteredTasks;
    };

    const tag = allTags.find((tag) => tag.id === tagID) || {
      id: 'all',
      name: 'Default',
    };

    if (tag.id === 'all') {
      setShowTasks(tasks);
      return;
    }
    // Call the recursive function and update the state
    const tasksWithTag = await filterByTag(tasks, tag);
    setShowTasks(tasksWithTag);
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
