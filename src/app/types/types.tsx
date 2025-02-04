import type { Emojis } from '@/lib/shared';
export interface TagProps {
  id: string;
  name: string;
}
export interface TaskProps {
  id: string;
  title: string;
  description: string;
  status: 'Unassigned' | 'Assigned' | 'UnderReview' | 'InRecheck' | 'Done';
  projectId: string;
  parentTaskId: string; //fix to type initial,subtaskAdded,...
  statusBudget: string; //Name not mathch the db 'Budgets / Budget'
  budget: number;
  advance: number;
  expense: number;
  startDate: Date;
  endDate: Date;
  createdById: string;
  owner: { id: string; name: string; email: string }[];
  members: { id: string; name: string; email: string }[];
  tags?: TagProps[];
  subtasks?: TaskProps[];
  emojis: Emojis[];
}
