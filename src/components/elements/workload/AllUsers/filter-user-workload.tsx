import BASE_URL, {type UserWorkload, type ProjectTagProp } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { useCallback, useEffect, useState } from 'react';
import type { TaskProps, TagProps } from '@/app/types/types';
import { useAuth } from '@/hooks/use-auth';
import { FilterByTags } from '@/components/elements/control-bar';
import { useAtom } from 'jotai';
import { tagsListAtom } from '@/atom';
interface FilterProps {
  originalUserWorkload: UserWorkload[];
  setUserWorkload: React.Dispatch<React.SetStateAction<UserWorkload[]>>;
}
export const FilterTagWorkload = ({  originalUserWorkload, setUserWorkload}: FilterProps) => {
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
  // ถ้าไม่ได้เลือก จะรีเซ็ตกลับไป
  if (selectedTagIds.length === 0) {
    setUserWorkload(originalUserWorkload);
    return;
  }

  // แปลงจาก ID → ชื่อแท็ก
  const selectedTagNames = selectedTagIds
    .map(id => allTags.find(tag => tag.id === id)?.name)
    .filter((name): name is string => !!name);

  const filteredUsers = originalUserWorkload.filter(user => {
    // สร้างเซตจากทุกแท็กของทุกโปรเจ็กด้วย flatMap
    const tagSet = new Set<string>(
      user.projects.flatMap(project => project.tags)
    );

    // เช็คว่าในเซตมีแท็กที่เลือกครบทุกตัวหรือไม่ (AND)
    return selectedTagNames.every(name => tagSet.has(name));
  });

  setUserWorkload(filteredUsers);
};



  return <FilterByTags onSelectTagChange={handleTagSelected} />;
};


