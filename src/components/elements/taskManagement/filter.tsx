import BASE_URL, { type ProjectTagProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { useCallback, useEffect, useState } from 'react';
import type { TaskProps, TagProps } from '@/app/types/types';
import { useAuth } from '@/hooks/use-auth';
import { FilterByTags } from '@/components/elements/control-bar';
import { useAtom } from 'jotai';
import { tagsListAtom } from '@/atom';
interface FilterProps {
  tasks: TaskProps[];
  setShowTasks: (prev: TaskProps[]) => void;
}

export const Filter = ({ tasks, setShowTasks }: FilterProps) => {
  const [allTags, setAllTags] = useState<TagProps[]>([]);
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
        setAllTags(data.filter((tag) => tag.isProject === false));
      } catch (error) {
        console.error(error);
      }
    };
    fetchTagData();
  }, [auth]);

  /* setTagsList on filter */
  const [, setTagsList] = useAtom<ProjectTagProp[]>(tagsListAtom);

  const handleTagSelection = useCallback(() => {
    const tagMap = allTags.reduce((tags, tag) => {
      tags.set(tag.id, { value: tag.id, label: tag.name });
      return tags;
    }, new Map());

    setTagsList(Array.from(tagMap.values()));
  }, [tasks, setTagsList, setShowTasks]);

  useEffect(() => {
    handleTagSelection();
  }, [handleTagSelection]);

  /* setTask and handleTagSelected */
  const handleTagSelected = (selectedTags: string[]) => {
    if (selectedTags.length === 0) {
      setShowTasks(tasks);
      return;
    }

    const filteredTasks = tasks.filter((task) => {
      const subtaskTagIds =
        task.subtasks?.flatMap((subtask) => subtask.tags?.map((tag) => tag.id) ?? []) ?? [];
      const taskTagIds = task.tags?.map((tag) => tag.id) ?? [];

      const allTagIds = [...taskTagIds, ...subtaskTagIds];
      return selectedTags.every((id) => allTagIds.includes(id));
    });

    setShowTasks(filteredTasks);
  };

  return <FilterByTags onSelectTagChange={handleTagSelected} />;
};
