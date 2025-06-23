'use client';
import BASE_URL, { type Project } from '@/lib/shared';
import React, { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { getCookie } from 'cookies-next';
import {
  Createproject,
  FilterByDateRange,
  FilterByTags,
  Searchbar,
  SortButton,
} from '../control-bar';
import { SortProject, SortDefault } from './sort-pin-project';
import { FilterProject } from './filterProject';
import { ProjectCard } from './projectCard';
import LoadingClient from '../loading-screen';
export const ProjectList = () => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [projectList, setProjectList] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true); // เพิ่มบรรทัดนี้
  const [query, setQuery] = React.useState<Project[]>([]);
  const [starredProjects, setStarredProjects] = React.useState<Record<string, boolean>>({});
  const { handleSort } = SortProject({
    query,
    setQuery,
    starredProjects,
    setStarredProjects,
  });
  const { handleTagSelection, handleDateRangeChange, handleSearchInputChange } = FilterProject({
    query,
    setQuery,
    projectList,
    setProjectList,
    starredProjects,
    setStarredProjects,
  });
  const { sortDefault } = SortDefault({
    query,
    setQuery,
    starredProjects,
    setStarredProjects,
  });
  // Effect hook to update project list when API data is fetched
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const fetchAllProjects = async () => {
      setIsLoading(true); // เริ่มโหลด
      try {
        const response = await fetch(`${BASE_URL}/v2/projects/`, {
          headers: { Authorization: auth, 'Accept-Encoding': 'gzip' },
        });

        if (!response.ok) {
          const errorMessage = await response.text();
        }

        const data = await response.json();
        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }

        const temp = parseJsonValues(data);
        setProjectList(temp);
        setQuery(temp);

        const pinnedProjects = temp?.filter((item) => item?.isPinned) ?? [];

        const updatedStarredProjects = pinnedProjects.reduce(
          (acc, item) => {
            if (item?.id) {
              acc[item.id] = true;
            }
            return acc;
          },
          {} as Record<string, boolean>,
        );

        setStarredProjects(updatedStarredProjects);
        await sortDefault(temp || [], false);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProjects();
  }, [auth]);

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center w-full h-screen">
          <LoadingClient />
        </div>
      ) : (
        <>
          <div className="flex w-full justify-between flex-wrap gap-2">
            <FilterByDateRange onDateChange={handleDateRangeChange} />
            <FilterByTags onSelectTagChange={handleTagSelection} />
            <Searchbar onSearchChange={handleSearchInputChange} placeholder="Search project..." />
            <SortButton onSelectChange={handleSort} />
            <Createproject />
          </div>
          <ProjectCard
            query={query}
            setQuery={setQuery}
            projectList={projectList}
            setProjectList={setProjectList}
            starredProjects={starredProjects}
            setStarredProjects={setStarredProjects}
          />
        </>
      )}
    </>
  );
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const parseJsonValues = (values: any[]): Project[] => {
  return values.map((value) => ({
    id: value.id,
    title: value.title,
    description: value.description,
    budget: value.budget,
    advance: value.advance,
    expense: value.expense,
    startDate: value.startDate,
    endDate: value.endDate,
    createdById: value.createdById,
    owner: value.owner,
    members: value.members,
    tags: value.tags,
    isPinned: value.isPinned,
    updatedAt: value.updatedAt,
  }));
};
