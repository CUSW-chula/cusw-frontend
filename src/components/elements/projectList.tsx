'use client';
import { PopoverContent } from '@radix-ui/react-popover';
import { CommandGroup, CommandItem } from 'cmdk';
import { Calendar, CrownIcon, Users, Star } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { getCookie } from 'cookies-next';
import { Button } from '../ui/button';
import BASE_URL, { type ProjectTagProp, type Project, type Tag, type User } from '@/lib/shared';
import {
  FilterByTags,
  FilterByDateRange,
  Createproject,
  SortButton,
  Searchbar,
} from '@/components/elements/control-bar';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { tagsListAtom } from '@/atom';

export const ProjectList = () => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [projectList, setProjectList] = React.useState<Project[]>([]);
  const [query, setQuery] = React.useState<Project[]>([]);

  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/projects`, {
          headers: { Authorization: auth },
        });
        const data = await response.json();
        setProjectList(data);
        setQuery(data);
        console.log('All projects fetched successfully:', data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchAllProjects();
  }, [auth]);

  //owner
  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    return nameParts.map((part) => part[0]).join(''); // Take the first letter of each part
  };

  const getFirstName = (name: string) => {
    const nameParts = name.split(' ');
    return nameParts[0];
  };

  const formatDate = (startdate: Date | null, enddate: Date | null): string => {
    // Return an empty string if both dates are not provided
    if (!startdate || !enddate) return '';

    const format = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Format startdate and enddate if they are valid
    const start = startdate ? format(startdate) : '';
    const end = enddate ? format(enddate) : '';
    return `${start}${start && end ? ' -> ' : ''}${end}`;
  };

  const [isActive, setIsActive] = React.useState(false);
  const handlesetIsActive = () => {
    setIsActive(!isActive);
  };
  const [starredProjects, setStarredProjects] = React.useState<Record<string, boolean>>({});
  const toggleStar = (projectId: string) => {
    setStarredProjects((prevState) => ({
      ...prevState,
      [projectId]: !prevState[projectId],
    }));
  };
  const [dateRange, setDateRange] = React.useState<{ from: string; to: string } | undefined>();
  const [searchText, setSearchText] = React.useState('');
  const [filterTag, setfilterTag] = React.useState<string[]>([]);

  /* filter and Search by daterange zone */
  const handleFilterByDateRangeAndSearch = (
    dateRange: { from: string; to: string } | undefined,
    searchText: string,
    filterTag: string[],
  ) => {
    let filteredProjects = [...projectList];
    if (filterTag && filterTag.length > 0) {
      filteredProjects = filteredProjects.filter((project) => {
        return (project.tags as Tag[]).some((tag) => filterTag.includes(tag.name));
      });
    }
    if (dateRange?.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      filteredProjects = filteredProjects.filter((project) => {
        const projectStartDate = new Date(project.startDate);
        const projectEndDate = new Date(project.endDate);

        return (
          (projectStartDate >= fromDate && projectStartDate <= toDate) ||
          (projectEndDate >= fromDate && projectEndDate <= toDate) ||
          (projectStartDate <= fromDate && projectEndDate >= toDate)
        );
      });
    }

    if (searchText.trim() !== '') {
      filteredProjects = filteredProjects.filter((project) => {
        const projectTitle = project.title.toLocaleLowerCase().trim();
        return projectTitle.includes(searchText.toLocaleLowerCase().trim());
      });
    }
    setQuery(filteredProjects);
  };

  const handleDateRangeChange = (dateRange: { from: string; to: string } | undefined) => {
    setDateRange(dateRange);
    handleFilterByDateRangeAndSearch(dateRange, searchText, filterTag);
  };

  const handleSearchInputChange = (text: string) => {
    setSearchText(text);
    handleFilterByDateRangeAndSearch(dateRange, text, filterTag);
  };

  const sortByStartDate = async (projects: Project[], inOrder: boolean) => {
    const sorted = [...projects].sort((project1, project2) => {
      if (project1.startDate === null) return 1;
      if (project2.startDate === null) return -1;
      return inOrder
        ? new Date(project1.startDate).getTime() - new Date(project2.startDate).getTime()
        : new Date(project2.startDate).getTime() - new Date(project1.startDate).getTime();
    });
    setQuery(sorted);
  };

  const sortByEndDate = async (projects: Project[], inOrder: boolean) => {
    const sorted = [...projects].sort((project1, project2) => {
      if (project1.endDate === null) return 1;
      if (project2.endDate === null) return -1;
      return inOrder
        ? new Date(project1.endDate).getTime() - new Date(project2.endDate).getTime()
        : new Date(project2.endDate).getTime() - new Date(project1.endDate).getTime();
    });
    setQuery(sorted);
  };

  const sortByExpectedBudget = async (projects: Project[], inOrder: boolean) => {
    const sorted = [...projects].sort((project1, project2) => {
      if (project1.budget === null) return 1;
      if (project2.budget === null) return -1;
      return inOrder
        ? new Date(project1.budget).getTime() - new Date(project2.budget).getTime()
        : new Date(project2.budget).getTime() - new Date(project1.budget).getTime();
    });
    setQuery(sorted);
  };

  const handleSort = (value: string) => {
    switch (value) {
      case 'Start Date ↑':
        return sortByStartDate(query, true);
      case 'Start Date ↓':
        return sortByStartDate(query, false);
      case 'End Date ↑':
        return sortByEndDate(query, true);
      case 'End Date ↓':
        return sortByEndDate(query, false);
      case 'Highest':
        return sortByExpectedBudget(query, false);
      case 'Lowest':
        return sortByExpectedBudget(query, true);
    }
  };
  const handleTagSelection = (selectedTags: string[]) => {
    setfilterTag(selectedTags);
    handleFilterByDateRangeAndSearch(dateRange, searchText, selectedTags);
  };

  const [, setTagsList] = useAtom<ProjectTagProp[]>(tagsListAtom);
  function handleProjectTags() {
    const tags: Tag[] = [];
    projectList.map((project) =>
      project.tags.map((tag) => tags.push({ id: tag.id, name: tag.name })),
    );
    const newFrameworksList = tags.map((tag) => ({
      value: tag.name,
      label: tag.name,
    }));

    setTagsList(newFrameworksList);
  }
  // biome-ignore lint/correctness/useExhaustiveDependencies(a): < Must have >
  useEffect(() => {
    handleProjectTags();
  }, [projectList]);

  return (
    <>
      <div className="flex w-full justify-between flex-wrap gap-2">
        <FilterByDateRange onDateChange={handleDateRangeChange} />
        <FilterByTags onSelectTagChange={handleTagSelection} />
        <Searchbar onSearchChange={handleSearchInputChange} />
        <SortButton onSelectChange={handleSort} />
        <Createproject />
      </div>
      <div className="flex items-start content-start gap-[16px] flex-wrap ">
        {query.length > 0 ? (
          query.map((project) => (
            <a key={project.id} href={`/projects/${project.id}`}>
              <div
                key={project.id}
                className="flex flex-start w-[308px] h-[284px] p-[18px] gap-[10px] bg-white border-[1px] border-brown rounded-[6px] relative">
                <div className="flex flex-col gap-y-[8px] ">
                  <div className="h-[56px] w-[204px] self-stretch">
                    <div className="font-BaiJamjuree text-[16px] text-base font-medium leading-[1.75] ">
                      {project.title}
                    </div>
                  </div>

                  <div className="absolute top-[15px] right-[20px]">
                    <button type="button" onClick={() => toggleStar(project.id)}>
                      {starredProjects[project.id] ? (
                        <Star className="text-brown h-[24px] w-[24px] fill-yellow" />
                      ) : (
                        <Star className="text-brown h-[24px] w-[24px]" />
                      )}
                    </button>
                  </div>

                  <div className="absolute top-[60px] right-[20px]  ">
                    <div className="flex flex-col flex-wrap items-end">
                      {project.tags?.slice(0, 4).map((tag) => (
                        <Badge
                          key={tag?.id}
                          variant="destructive"
                          className="h-7 min-w-fit px-[8px] py-[12px] flex items-center justify-center bg-[#EEFDF7] border-x border-y border-[#69BCA0] text-[#69BCA0] mr-1 mt-1 mb-1">
                          <span className="text-base font-medium font-BaiJamjuree">
                            {tag?.name}
                          </span>
                        </Badge>
                      ))}
                      {project.tags && project.tags.length > 4 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                variant="destructive"
                                className="h-7 min-w-fit px-[8px] py-[12px] flex items-center justify-center bg-[#EEFDF7] border-x border-y border-[#69BCA0] text-[#69BCA0] mr-1 mt-1 mb-1">
                                <div className="text-base font-medium font-BaiJamjuree">
                                  +{project.tags.length - 4}
                                </div>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="flex flex-col flex-wrap items-start">
                                {project.tags?.map((tag) => (
                                  <Badge
                                    key={tag?.id}
                                    variant="destructive"
                                    className="h-7 min-w-fit px-[8px] py-[12px] flex items-center justify-center bg-[#EEFDF7] border-x border-y border-[#69BCA0] text-[#69BCA0] mr-1 mt-1 mb-1">
                                    <span className="text-base font-medium font-BaiJamjuree">
                                      {tag?.name}
                                    </span>
                                  </Badge>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>

                  <div className="flex-row flex">
                    <CrownIcon className="w-[24px] h-[24px] relative text-black mr-1" />
                    <TooltipProvider>
                      <div className="flex items-center space-x-[4px] gap-1">
                        {project.owner.map((user) => (
                          <Tooltip key={user?.id ?? user?.email}>
                            <TooltipTrigger>
                              <div className="flex items-center space-x-2">
                                <div className="w-[24px] h-[24px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
                                  <span className="text-brown text-[12px] font-BaiJamjuree">
                                    {getInitials(user?.name || '')}
                                  </span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{user?.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </TooltipProvider>
                  </div>
                  <div className="flex-row flex">
                    <Users className="w-[24px] h-[24px] relative text-black mr-1" />
                    <TooltipProvider>
                      <div className="flex items-center space-x-[4px]">
                        {project.members.map((user) => (
                          <Tooltip key={user?.id ?? user?.email}>
                            <TooltipTrigger>
                              <div className="flex items-center space-x-2">
                                <div className="w-[24px] h-[24px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
                                  <span className="text-brown text-[12px] font-BaiJamjuree">
                                    {getInitials(user?.name || '')}
                                  </span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{user?.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </TooltipProvider>
                  </div>

                  <div className="w-[24px] h-[24px] flex flex-row  ">
                    <div className="flex items-center justify-center font-BaiJamjuree text-[24px] text-center h-full w-full font-semibold">
                      ฿
                    </div>

                    {/* <img src="/asset/icon/budget-black.svg" alt="Budget Icon " /> */}
                    <div className="font-BaiJamjuree text-[14px] font-medium flex text-center ml-1">
                      {project.budget}
                    </div>
                  </div>
                  <div className="w-[24px] h-[24px] flex flex-row  ">
                    <div className="flex items-center justify-center font-BaiJamjuree text-[24px] text-center h-full w-full text-[#EF4444] font-semibold">
                      ฿
                    </div>

                    {/* <img src="/asset/icon/budget-red.svg" alt="Budget Icon " /> */}
                    <div className="font-BaiJamjuree text-[14px] font-medium flex text-center ml-1 text-[#EF4444]">
                      {project.expense}
                    </div>
                  </div>
                  <div className="w-[24px] h-[24px] flex flex-row  ">
                    <div className="flex items-center justify-center font-BaiJamjuree text-[24px] text-center h-full w-full text-[#69BCA0] font-semibold">
                      ฿
                    </div>
                    {/* <img src="/asset/icon/budget-green.svg" alt="Budget Icon " /> */}
                    <div className="font-BaiJamjuree text-[14px] font-medium flex text-center ml-1 text-[#69BCA0]">
                      {project.advance}
                    </div>
                  </div>

                  <div className="flex flex-row">
                    <Calendar className="w-[24px] h-[24px] relative text-black mr-1" />
                    {/* {item.startDate && item.endDate && ( */}
                    <div className="text-[14px] font-BaiJamjuree flex  gap-1 items-center">
                      <span>
                        {formatDate(new Date(project.startDate), new Date(project.endDate))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))
        ) : (
          <div>No projects found</div>
        )}
      </div>
    </>
  );
};
