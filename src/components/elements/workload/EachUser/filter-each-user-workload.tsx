import BASE_URL, {type UserWorkload, type ProjectTagProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { useCallback, useEffect, useState } from 'react';
import type { TaskProps, TagProps } from '@/app/types/types';
import { useAuth } from '@/hooks/use-auth';
import { FilterByTags } from '@/components/elements/control-bar';
import { useAtom } from 'jotai';
import { tagsListAtom } from '@/atom';
interface FilterProps {
  originalEachUserWorkload: UserWorkload[];
  setEachUserWorkload: React.Dispatch<React.SetStateAction<UserWorkload[]>>;
}
export const FilterTagWorkloadEachUser = ({  originalEachUserWorkload, setEachUserWorkload}: FilterProps) => {
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
        setAllTags(data.filter((tag) => tag.isProject === true));
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
  }, [allTags,setTagsList]);

  useEffect(() => {
    handleTagSelection();
  }, [handleTagSelection]);

  /* setTask and handleTagSelected */
const handleTagSelected = (selectedTagIds: string[]) => {
  if (selectedTagIds.length === 0) {
    setEachUserWorkload(originalEachUserWorkload);
    return;
  }

  // แปลงจาก ID → ชื่อแท็ก
  const selectedTagNames = selectedTagIds
    .map(id => allTags.find(tag => tag.id === id)?.name)
    .filter((name): name is string => !!name);

  const filteredUsers = originalEachUserWorkload
    .map(user => {
      // filter โปรเจกต์ของ user ตาม tag ที่เลือก
      const filteredProjects = user.projects.filter(project =>
        selectedTagNames.every(tagName => project.tags.includes(tagName))
      );

      // คืน user พร้อมโปรเจกต์ที่เหลือ
      return {
        ...user,
        projects: filteredProjects
      };
    })
    // เอาเฉพาะ user ที่ยังมีโปรเจกต์เหลือหลังจาก filter
    .filter(user => user.projects.length > 0);

  setEachUserWorkload(filteredUsers);
};




  return <FilterByTags onSelectTagChange={handleTagSelected} />;
};
