import React from "react";
import { UsePinned } from "./sort-pin-project";
import BASE_URL, {
  type ProjectTagProp,
  type Project,
  type Tag,
  BASE_SOCKET,
} from "@/lib/shared";

export const Filter = () => {
  const [dateRange, setDateRange] = React.useState<
    { from: string; to: string } | undefined
  >();
  const [searchText, setSearchText] = React.useState("");
  const [filterTag, setfilterTag] = React.useState<string[]>([]);
  const [projectList, setProjectList] = React.useState<Project[]>([]);
  const { sortByStarredProjects } = UsePinned();
  const [query, setQuery] = React.useState<Project[]>([]);
  const handleSearchInputChange = (text: string) => {
    setSearchText(text);
    handleFilterByDateRangeAndSearch(dateRange, text, filterTag);
  };
  const handleDateRangeChange = (
    dateRange: { from: string; to: string } | undefined
  ) => {
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
    filterTag: string[]
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
        const projectStartDate = project.startDate
          ? new Date(project.startDate)
          : null;
        const projectEndDate = project.endDate
          ? new Date(project.endDate)
          : null;

        console.log(`start: ${fromDate}, end: ${toDate}`);
        console.log(`pjstart: ${projectStartDate}, pjend: ${projectEndDate}`);

        if (!projectStartDate) return false;
        if (!projectEndDate) {
          return fromDate <= projectStartDate && projectStartDate <= toDate;
        }

        return !(projectStartDate < fromDate) && !(projectEndDate > toDate);
      });
    }

    if (searchText.trim() !== "") {
      filteredProjects = filteredProjects.filter((project) => {
        const projectTitle = project.title.toLocaleLowerCase().trim();
        return projectTitle.includes(searchText.toLocaleLowerCase().trim());
      });
    }
    // setQuery(filteredProjects);
    setQuery(sortByStarredProjects(filteredProjects));
  };
  return {
    handleTagSelection,
    handleDateRangeChange,
    handleFilterByDateRangeAndSearch,
    handleSearchInputChange,
  };
};
