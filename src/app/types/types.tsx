import type { Emojis } from '@/lib/shared';
export interface TagProps {
  id: string;
  name: string;
  isProject: boolean;
}
export interface TaskProps {
  id: string;
  title: string;
  description: string;
  status: 'Unassigned' | 'Assigned' | 'UnderReview' | 'InRecheck' | 'Done';
  doneAt: Date | null;
  projectId: string;
  parentTaskId: string; //fix to type initial,subtaskAdded,...
  position: number;
  statusBudget: string; //Name not mathch the db 'Budgets / Budget'
  budget: number;
  advance: number;
  expense: number;
  startDate: Date | null;
  endDate: Date | null;
  createdById: string;
  owner: {
    id: string;
    name: string;
    email: string;
    admin: boolean;
    head: boolean;
    activated: boolean;
  }[];
  members: {
    id: string;
    name: string;
    email: string;
    admin: boolean;
    head: boolean;
    activated: boolean;
  }[];
  tags?: TagProps[];
  subtasks?: TaskProps[];
  emojis: Emojis[];
}

export interface FilterTasks {
  searchTerm: string;
  category: TagProps[];
  sort: 'stDate_asc' | 'stDate_desc' | 'endDate_asc' | 'endDate_desc';
}

export type ProjectRole = 'ProjectOwner' | 'Member' | undefined;

export type TaskRole = 'assignee' | 'owner' | undefined;

export type PermissionContext = {
  projectRole: ProjectRole;
  taskRole: TaskRole;
  isAdmin: boolean;
  isHead: boolean;
};
