'use client';

import BASE_URL, { type UserWorkload, type ProjectTagProp } from '@/lib/shared';
import { useCallback, useEffect, useState } from 'react';
import type { TagProps } from '@/app/types/types';
import { useAuth } from '@/hooks/use-auth';
import { FilterByDateRange,  SelectByTagsWorkload } from '@/components/elements/control-bar';
import { useAtom } from 'jotai';
import { tagsListAtom } from '@/atom';

interface FilterProps {
  originalUserWorkload: UserWorkload[];
  setUserWorkload: React.Dispatch<React.SetStateAction<UserWorkload[]>>;
}

export const FilterAllUserWorkload = ({ originalUserWorkload, setUserWorkload }: FilterProps) => {
  const [allTags, setAllTags] = useState<TagProps[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | undefined>();

  const auth = useAuth();
  const [, setTagsList] = useAtom<ProjectTagProp[]>(tagsListAtom);

  // ดึง tag จาก db
  useEffect(() => {
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

  // เซต tag dropdown
  const handleTagSelection = useCallback(() => {
    const tagMap = allTags.reduce((tags, tag) => {
      tags.set(tag.id, { value: tag.id, label: tag.name });
      return tags;
    }, new Map());

    setTagsList(Array.from(tagMap.values()));
  }, [allTags, setTagsList]);

  useEffect(() => {
    handleTagSelection();
  }, [handleTagSelection]);

  // รวม filter tag + date
  const handleFilter = useCallback(
    (selectedTagIds: string[], dateRange: { from: string; to: string } | undefined) => {
      let filteredUsers = [...originalUserWorkload];

      if (selectedTagIds.length > 0) {
        const selectedTagNames = selectedTagIds
          .map((id) => allTags.find((tag) => tag.id === id)?.name)
          .filter((name): name is string => !!name);

        filteredUsers = filteredUsers.filter((user) => {
          const tagSet = new Set<string>(user.projects.flatMap((project) => project.tags));
          return selectedTagNames.some((name) => tagSet.has(name)); // <- เปลี่ยนตรงนี้จาก every เป็น some
        });
      }

      // Filter by date
      if (dateRange?.from && dateRange?.to) {
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);

        filteredUsers = filteredUsers.filter((user) =>
          user.projects.some((project) => {
            const projectStart = project.startDate ? new Date(project.startDate) : null;
            const projectEnd = project.endDate ? new Date(project.endDate) : null;

            if (!projectStart) return false;
            if (!projectEnd) return fromDate <= projectStart && projectStart <= toDate;

            return !(projectStart > toDate || projectEnd < fromDate);
          }),
        );
      }

      setUserWorkload(filteredUsers);
    },
    [originalUserWorkload, allTags, setUserWorkload],
  );

  // เมื่อเลือก tag ใหม่
  const handleTagSelected = (selectedIds: string[]) => {
    setSelectedTagIds(selectedIds);
    handleFilter(selectedIds, dateRange);
  };

  // เมื่อเลือก date ใหม่
  const handleDateRangeChange = (range: { from: string; to: string } | undefined) => {
    setDateRange(range);
    handleFilter(selectedTagIds, range);
    console.log('Date range changed:', range);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <FilterByDateRange onDateChange={handleDateRangeChange} />
      <SelectByTagsWorkload onSelectTagChange={handleTagSelected} />
    </div>
  );
};
