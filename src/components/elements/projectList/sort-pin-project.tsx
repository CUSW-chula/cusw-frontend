'use client';
import * as React from 'react';
import { getCookie } from 'cookies-next';
import BASE_URL, { type Project } from '@/lib/shared';
import { toast } from '@/hooks/use-toast';

export const UsePinned = (
  starredProjects: Record<string, boolean>,
  setStarredProjects: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  const toggleStar = async (projectId: string) => {
    setStarredProjects((prevState) => {
      const isCurrentlyStarred = prevState[projectId] ?? false;
      return {
        ...prevState,
        [projectId]: !isCurrentlyStarred,
      };
    });

    const isCurrentlyStarred = starredProjects[projectId] ?? false;
    const response = await fetch(`${BASE_URL}/v2/projects/pin/${projectId}`, {
      method: isCurrentlyStarred ? 'DELETE' : 'POST',
      headers: { Authorization: auth },
    });
    if (!response.ok) {
      const errorMessage = await response.text();
    }

    // 🔄 รีเซ็ตค่า UI กลับถ้า API ล้มเหลว
    setStarredProjects((prevState) => {
      const wasStarred = prevState[projectId] ?? false;
      return {
        ...prevState,
        [projectId]: wasStarred,
      };
    });
  };
  const sortByStarredProjects = React.useCallback(
    (projects: Project[]) => {
      return [...projects].sort((a, b) => {
        const aStarred = starredProjects[a.id] ? 1 : 0;
        const bStarred = starredProjects[b.id] ? 1 : 0;
        return bStarred - aStarred; // เรียงโปรเจ็กต์ที่ starred ไว้ก่อน
      });
    },
    [starredProjects],
  );
  return { toggleStar, starredProjects, sortByStarredProjects };
};

interface SortProps {
  query: Project[];
  setQuery: React.Dispatch<React.SetStateAction<Project[]>>;
  starredProjects: Record<string, boolean>;
  setStarredProjects: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}
export const SortDefault = ({
  query,
  setQuery,
  starredProjects,
  setStarredProjects,
}: SortProps) => {
  const { sortByStarredProjects } = UsePinned(starredProjects, setStarredProjects);

  const sortDefault = async (projects: Project[], inOrder: boolean) => {
    const sorted = [...projects].sort((project1, project2) => {
      if (project1.updatedAt === null) return 1;
      if (project2.updatedAt === null) return -1;
      return inOrder
        ? new Date(project1.updatedAt).getTime() - new Date(project2.updatedAt).getTime()
        : new Date(project2.updatedAt).getTime() - new Date(project1.updatedAt).getTime();
    });
    setQuery(sortByStarredProjects(sorted));
  };

  return { sortDefault }; // ส่งคืนฟังก์ชัน sortDefault
};
export const SortProject = ({
  query,
  setQuery,
  starredProjects,
  setStarredProjects,
}: SortProps) => {
  const { sortByStarredProjects } = UsePinned(starredProjects, setStarredProjects);
  const sortByLastUpdated = async (projects: Project[], inOrder: boolean) => {
    const sorted = [...projects].sort((project1, project2) => {
      if (project1.updatedAt === null) return 1;
      if (project2.updatedAt === null) return -1;
      return inOrder
        ? new Date(project1.updatedAt).getTime() - new Date(project2.updatedAt).getTime()
        : new Date(project2.updatedAt).getTime() - new Date(project1.updatedAt).getTime();
    });
    setQuery(sortByStarredProjects(sorted));
  };
  const sortByStartDate = async (projects: Project[], inOrder: boolean) => {
    const sorted = [...projects].sort((project1, project2) => {
      if (project1.startDate === null) return 1;
      if (project2.startDate === null) return -1;
      return inOrder
        ? new Date(project1.startDate).getTime() - new Date(project2.startDate).getTime()
        : new Date(project2.startDate).getTime() - new Date(project1.startDate).getTime();
    });
    setQuery(sortByStarredProjects(sorted));
  };

  const sortByEndDate = async (projects: Project[], inOrder: boolean) => {
    const sorted = [...projects].sort((project1, project2) => {
      if (project1.endDate === null) return 1;
      if (project2.endDate === null) return -1;
      return inOrder
        ? new Date(project1.endDate).getTime() - new Date(project2.endDate).getTime()
        : new Date(project2.endDate).getTime() - new Date(project1.endDate).getTime();
    });
    setQuery(sortByStarredProjects(sorted));
  };

  const sortByExpectedBudget = async (projects: Project[], inOrder: boolean) => {
    const sorted = [...projects].sort((project1, project2) => {
      if (project1.budget === null) return 1;
      if (project2.budget === null) return -1;
      return inOrder
        ? new Date(project1.budget).getTime() - new Date(project2.budget).getTime()
        : new Date(project2.budget).getTime() - new Date(project1.budget).getTime();
    });
    setQuery(sortByStarredProjects(sorted));
  };

  const handleSort = (value: string) => {
    switch (value) {
      case 'Last Updated':
        return sortByLastUpdated(query, false);
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    setQuery((prevQuery: Project[]) => sortByStarredProjects(prevQuery));
  }, [sortByStarredProjects]);
  return { handleSort };
};
