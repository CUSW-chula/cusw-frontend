'use client';
import React from 'react';
import { UsePinned } from './sort-pin-project';
import BASE_URL, { type ProjectTagProp, type Project, type Tag } from '@/lib/shared';
import { useAtom } from 'jotai';
import { tagsListAtom } from '@/atom';
interface FilterProps {
  query: Project[];
  setQuery: (prev: Project[]) => void;
  projectList: Project[];
  setProjectList: (prev: Project[]) => void;
  starredProjects: Record<string, boolean>;
  setStarredProjects: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}
export const FilterProject = ({
  query,
  setQuery,
  projectList,
  setProjectList,
  starredProjects,
  setStarredProjects,
}: FilterProps) => {
  const [dateRange, setDateRange] = React.useState<{ from: string; to: string } | undefined>();
  const [searchText, setSearchText] = React.useState('');
  const [filterTag, setfilterTag] = React.useState<string[]>([]);
  const { sortByStarredProjects } = UsePinned(starredProjects, setStarredProjects);
  const handleSearchInputChange = (text: string) => {
    setSearchText(text);
    handleFilterByDateRangeAndSearch(dateRange, text, filterTag);
  };
  const handleDateRangeChange = (dateRange: { from: string; to: string } | undefined) => {
    setDateRange(dateRange);
    handleFilterByDateRangeAndSearch(dateRange, searchText, filterTag);
  };

  const handleTagSelection = (selectedTags: string[]) => {
    setfilterTag(selectedTags);
    handleFilterByDateRangeAndSearch(dateRange, searchText, selectedTags);
  };

  const handleFilterByDateRangeAndSearch = (
    dateRange: { from: string; to: string } | undefined,
    searchText: string,
    filterTag: string[],
  ) => {
    let filteredProjects = [...projectList];
    if (filterTag && filterTag.length > 0) {
      filteredProjects = filteredProjects.filter((project) => {
        return (
          project.tags.filter((tag) => {
            return tag.isProject;
          }) as Tag[]
        ).some((tag) => filterTag.includes(tag.name));
      });
    }
    if (dateRange?.from != null) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      filteredProjects = filteredProjects.filter((project) => {
        const projectStartDate = project.startDate ? new Date(project.startDate) : null;
        const projectEndDate = project.endDate ? new Date(project.endDate) : null;

        if (!projectStartDate) return false;
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
      filteredProjects = filteredProjects.filter((project) => {
        const projectTitle = project.title.toLocaleLowerCase().trim();
        return projectTitle.includes(searchText.toLocaleLowerCase().trim());
      });
    }
    // setQuery(filteredProjects);
    setQuery(sortByStarredProjects(filteredProjects));
  };

  const [, setTagsList] = useAtom<ProjectTagProp[]>(tagsListAtom);
  const handleProjectTags = React.useCallback(() => {
    const tagMap = new Map<string, { value: string; label: string }>();

    projectList.filter((project) =>
      project.tags.filter((tag) => {
        if (!tagMap.has(tag.name)) {
          tagMap.set(tag.name, { value: tag.name, label: tag.name });
        }
      }),
    );

    setTagsList(Array.from(tagMap.values()));
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
