import BASE_URL from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import type { TaskProps, TagProps } from '@/app/types/types';
import { useAuth } from '@/hooks/use-auth';

interface FilterProps {
  tasks: TaskProps[];
  setShowTasks: (prev: TaskProps[]) => void;
}

export const Filter = ({ tasks, setShowTasks }: FilterProps) => {
  const [allTags, setAllTags] = useState<TagProps[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const auth = useAuth();
  useEffect(() => {
    //get all tags of tasks from db
    const fetchTagData = async () => {
      const url = `${BASE_URL}/v2/tags/`;
      const options = {
        method: 'GET',
        headers: {
          Authorization: auth,
        },
      };

      try {
        const response = await fetch(url, options);
        const data = (await response.json()) as TagProps[];
        setAllTags(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTagData();
  }, [auth]);

  const handleFilter = (tagId: string) => {
    setSelectedTag(tagId);
    if (tagId === 'all') {
      setShowTasks(tasks);
    } else {
      const filteredTasks = tasks.filter((task) => task.tags?.some((tag) => tag.id === tagId));
      setShowTasks(filteredTasks);
    }
  };

  return (
    <Select
      onValueChange={(value) => {
        handleFilter(value);
      }}>
      <SelectTrigger className="w-40 border-brown">
        <SelectValue className="text-brown" placeholder="Filter by: Tag">
          {selectedTag === 'all' ? 'All' : allTags.find((tag) => tag.id === selectedTag)?.name}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        <SelectItem key="default" value="all" className="font-BaiJamjuree">
          All
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
