'use client';
import { CommandGroup, CommandItem } from 'cmdk';
import { Calendar, CrownIcon, Users } from 'lucide-react';
import * as React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { getCookie } from 'cookies-next';
import BASE_URL from '@/lib/shared';
import {
  FilterByTags,
  FilterByDateRange,
  Createproject,
  SortButton,
  Searchbar,
} from '@/components/elements/control-bar';
import { useEffect } from 'react';
interface ProjectInterface {
  id: string;
  title: string;
  description: string;
  expectedBudget: number;
  realBudget: number;
  usedBudget: number;
  startDate: Date;
  endDate: Date;
  tags: [];
}

interface Tags {
  id: string;
  name: string;
}

interface UsersInterfaces {
  id: string;
  userName: string;
}

interface Date_st {
  startDate: Date;
  endDate: Date;
}
const item: Date_st = {
  startDate: new Date(), // วันที่เริ่มต้น
  endDate: new Date(), // วันที่สิ้นสุด
};

// mock data (default users)
const users: UsersInterfaces[] = [
  { id: '1', userName: 'Mintada Phuangminthada' },
  { id: '2', userName: 'Dintada Ahuangminthada' },
];

export const ProjectList = () => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [projectList, setProjectList] = React.useState<ProjectInterface[]>([]);
  const [query, setQuery] = React.useState<ProjectInterface[]>([]);

  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        const response = await fetch(`${BASE_URL}/projects`, {
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
        return (project.tags as Tags[]).some((tag) => filterTag.includes(tag.name));
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

  const sortByStartDate = async (projects: ProjectInterface[], inOrder: boolean) => {
    const sorted = [...projects].sort((project1, project2) => {
      if (project1.startDate === null) return 1; // If startDate is null, move to the end
      if (project2.startDate === null) return -1;
      return inOrder
        ? new Date(project1.startDate).getTime() - new Date(project2.startDate).getTime()
        : new Date(project2.startDate).getTime() - new Date(project1.startDate).getTime();
    });
    setQuery(sorted);
  };

  const sortByEndDate = async (projects: ProjectInterface[], inOrder: boolean) => {
    const sorted = [...projects].sort((project1, project2) => {
      if (project1.endDate === null) return 1; // If startDate is null, move to the end
      if (project2.endDate === null) return -1;
      return inOrder
        ? new Date(project1.endDate).getTime() - new Date(project2.endDate).getTime()
        : new Date(project2.endDate).getTime() - new Date(project1.endDate).getTime();
    });
    setQuery(sorted);
  };

  const sortByExpectedBudget = async (projects: ProjectInterface[], inOrder: boolean) => {
    const sorted = [...projects].sort((project1, project2) => {
      if (project1.expectedBudget === null) return 1; // If startDate is null, move to the end
      if (project2.expectedBudget === null) return -1;
      return inOrder
        ? new Date(project1.expectedBudget).getTime() - new Date(project2.expectedBudget).getTime()
        : new Date(project2.expectedBudget).getTime() - new Date(project1.expectedBudget).getTime();
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
            <div
              key={project.id}
              className="flex flex-start w-[416px] h-[260px] p-[18px] gap-[10px] bg-white border-[1px] border-brown rounded-[6px]">
              <div className="flex flex-start gap-[10px] rounded-[6px] self-stretch">
                <img width={158} height={224} alt="img" src="/asset/Options.svg" />
              </div>
              <div className="flex flex-col gap-y-[16px] ">
                <div className="h-[56px] w-[204px] self-stretch">
                  <div className="font-BaiJamjuree text-[16px] text-base font-medium leading-[1.75] ">
                    {project.title}
                  </div>
                </div>
                <div className="w-[24px] h-[24px] flex flex-row  ">
                  <img src="/asset/icon/budget-black.svg" alt="Budget Icon " />
                  <div className="font-BaiJamjuree text-[14px] font-medium flex text-center">
                    {project.expectedBudget}
                  </div>
                </div>
                <div className="w-[24px] h-[24px] flex flex-row  ">
                  <img src="/asset/icon/budget-red.svg" alt="Budget Icon " />
                  <div className="font-BaiJamjuree text-[14px] font-medium flex text-center text-[#EF4444]">
                    {project.realBudget}
                  </div>
                </div>
                <div className="flex-row flex">
                  <CrownIcon className="w-[24px] h-[24px] relative text-black" />
                  <TooltipProvider>
                    <div className="flex items-center space-x-[4px]">
                      {users.map((user) => (
                        <Tooltip key={user.id}>
                          <TooltipTrigger>
                            <div className="flex items-center space-x-2">
                              <div className="w-[24px] h-[24px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
                                <span className="text-brown text-[12px] font-BaiJamjuree">
                                  {getInitials(user.userName)}
                                </span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{user.userName}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>
                <div className="flex flex-row">
                  <Calendar className="w-[24px] h-[24px] relative text-black" />
                  {item.startDate && item.endDate && (
                    <div className="text-[14px] font-BaiJamjuree flex  gap-1 items-center">
                      <span>
                        {new Date(project.startDate).toLocaleDateString('en-GB')} -{' '}
                        {new Date(project.endDate).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>No projects found</div>
        )}
      </div>
    </>
  );
};
