"use client";
import React, { useEffect, useState } from "react";
import { UsePinned } from "./sort-pin-project";
import BASE_URL, {
  type ProjectTagProp,
  type Project,
  type Tag,
} from "@/lib/shared";
import { useAtom } from "jotai";
import { tagsListAtom } from "@/atom";
import { useAuth } from "@/hooks/use-auth";
import type { TagProps } from "@/app/types/types";
interface FilterProps {
  query: Project[];
  setQuery: (prev: Project[]) => void;
  projectList: Project[];
  setProjectList: (prev: Project[]) => void;
  starredProjects: Record<string, boolean>;
  setStarredProjects: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}
export const FilterProject = ({
  query,
  setQuery,
  projectList,
  setProjectList,
  starredProjects,
  setStarredProjects,
}: FilterProps) => {
  const auth = useAuth();
  const [, setTagsList] = useAtom<ProjectTagProp[]>(tagsListAtom);
  const [allTags, setAllTags] = useState<TagProps[]>([]);
  // ดึง tag จาก db
  useEffect(() => {
    const fetchTagData = async () => {
      const url = `${BASE_URL}/v2/tags/`;
      const options = {
        method: "GET",
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

  const [dateRange, setDateRange] = React.useState<
    { from: string; to: string } | undefined
  >();
  const [searchText, setSearchText] = React.useState("");
  const [filterTag, setfilterTag] = React.useState<string[]>([]);
  const { sortByStarredProjects } = UsePinned(
    starredProjects,
    setStarredProjects
  );
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
        const projectTagIds = project.tags
          .filter((tag) => tag.isProject)
          .map((tag) => tag.id); // ใช้ id แทน name

        return filterTag.every((tagId) => projectTagIds.includes(tagId));
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

    if (searchText.trim() !== "") {
      filteredProjects = filteredProjects.filter((project) => {
        const projectTitle = project.title.toLocaleLowerCase().trim();
        return projectTitle.includes(searchText.toLocaleLowerCase().trim());
      });
    }
    // setQuery(filteredProjects);
    setQuery(sortByStarredProjects(filteredProjects));
  };

  const handleProjectTags = React.useCallback(() => {
    if (!allTags) return;

    // สร้าง Map เพื่อเอา id เป็น key
    const tagMap = allTags.reduce((tags, tag) => {
      tags.set(tag.id, { value: tag.id, label: tag.name });
      return tags;
    }, new Map<string, { value: string; label: string }>());

    setTagsList(Array.from(tagMap.values()));
  }, [allTags, setTagsList]);

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
