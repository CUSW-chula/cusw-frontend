'use client';
import React from 'react';
import { useAtom } from 'jotai';
import type { ProjectTagProp, UserWorkload } from '@/lib/shared';
import { tagsListAtom } from '@/atom';

interface FilterWorkloadProps {
  userWorkload: UserWorkload[];
  setUserWorkload: (prev: UserWorkload[]) => void;
}

export const useFilterProjectWorkload = ({
  userWorkload,
  setUserWorkload,
}: FilterWorkloadProps) => {
  const [dateRange, setDateRange] = React.useState<{ from: string; to: string } | undefined>();
  const [searchText, setSearchText] = React.useState('');
  const [filterTag, setFilterTag] = React.useState<string[]>([]);

  const projectList = React.useMemo(
    () => userWorkload.flatMap((user) => user.projects),
    [userWorkload],
  );

  const handleSearchInputChange = (text: string) => {
    setSearchText(text);
    handleFilterByDateRangeAndSearch(dateRange, text, filterTag);
  };

  const handleDateRangeChange = (range: { from: string; to: string } | undefined) => {
    setDateRange(range);
    handleFilterByDateRangeAndSearch(range, searchText, filterTag);
  };

  const handleTagSelection = (selectedTags: string[]) => {
    setFilterTag(selectedTags);
    handleFilterByDateRangeAndSearch(dateRange, searchText, selectedTags);
  };

  const handleFilterByDateRangeAndSearch = (
    dateRange: { from: string; to: string } | undefined,
    searchText: string,
    filterTag: string[],
  ) => {
    let filteredProjects = [...projectList];

    if (filterTag.length > 0) {
      filteredProjects = filteredProjects.filter((project) => {
        return filterTag.every((tagName) => project.tags.includes(tagName));
      });
    }

    if (dateRange?.from && dateRange?.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      filteredProjects = filteredProjects.filter((project) => {
        if (!project.startDate) return false;
        const projectStartDate = new Date(project.startDate);
        const projectEndDate = project.endDate ? new Date(project.endDate) : null;

        if (!projectEndDate) {
          return fromDate <= projectStartDate && projectStartDate <= toDate;
        }

        if (projectStartDate > toDate || projectEndDate < fromDate) {
          return false;
        }
        return true;
      });
    }

    if (searchText.trim() !== '') {
      filteredProjects = filteredProjects.filter((project) =>
        project.title.toLowerCase().includes(searchText.toLowerCase().trim()),
      );
    }

    // map filteredProjects กลับ userWorkload structure
    const filteredUserWorkload = userWorkload
      .map((user) => ({
        ...user,
        projects: filteredProjects.filter((p) => user.projects.some((up) => up.id === p.id)),
      }))
      .filter((user) => user.projects.length > 0);

    setUserWorkload(filteredUserWorkload);
  };

  const [, setTagsList] = useAtom<ProjectTagProp[]>(tagsListAtom);

  const handleProjectTags = React.useCallback(() => {
    const tagMap = new Map<string, { value: string; label: string }>();

    for (const project of projectList) {
      for (const tag of project.tags) {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, { value: tag, label: tag });
        }
      }
    }

    const newTagsList = Array.from(tagMap.values());

    setTagsList((prevTagsList) => {
      const isSame =
        prevTagsList.length === newTagsList.length &&
        prevTagsList.every((t, i) => t.value === newTagsList[i].value);
      return isSame ? prevTagsList : newTagsList;
    });
  }, [projectList, setTagsList]);

  React.useEffect(() => {
    handleProjectTags();
  }, [handleProjectTags]);

  return {
    handleTagSelection,
    handleDateRangeChange,
    handleFilterByDateRangeAndSearch,
    handleSearchInputChange,
  };
};
