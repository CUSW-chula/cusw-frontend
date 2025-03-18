'use client';
import * as React from 'react';


import { getCookie } from 'cookies-next';

import BASE_URL, { type Project } from '@/lib/shared';
import {
  SortButton,
} from '@/components/elements/control-bar';

export const SortProject = (projects: Project[], inOrder: boolean) => {
    const cookie = getCookie('auth');
    const auth = cookie?.toString() ?? '';
    const [query, setQuery] = React.useState<Project[]>([]);
  
  
  
  const sortByStartDate = async (projects: Project[], inOrder: boolean) => {
    const sorted = [...projects].sort((project1, project2) => {
      if (project1.startDate === null) return 1;
      if (project2.startDate === null) return -1;
      return inOrder
        ? new Date(project1.startDate).getTime() - new Date(project2.startDate).getTime()
        : new Date(project2.startDate).getTime() - new Date(project1.startDate).getTime();
    });
    setQuery((sorted));
  };

  const sortByEndDate = async (projects: Project[], inOrder: boolean) => {
    const sorted = [...projects].sort((project1, project2) => {
      if (project1.endDate === null) return 1;
      if (project2.endDate === null) return -1;
      return inOrder
        ? new Date(project1.endDate).getTime() - new Date(project2.endDate).getTime()
        : new Date(project2.endDate).getTime() - new Date(project1.endDate).getTime();
    });
    setQuery((sorted));
  };

  const sortByExpectedBudget = async (projects: Project[], inOrder: boolean) => {
    const sorted = [...projects].sort((project1, project2) => {
      if (project1.budget === null) return 1;
      if (project2.budget === null) return -1;
      return inOrder
        ? new Date(project1.budget).getTime() - new Date(project2.budget).getTime()
        : new Date(project2.budget).getTime() - new Date(project1.budget).getTime();
    });
    setQuery((sorted));
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
  return(
    <>
    <SortButton onSelectChange={handleSort} />
    </>
  )
}