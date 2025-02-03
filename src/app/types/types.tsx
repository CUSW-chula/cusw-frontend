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
  parentTaskId: string;
  statusBudget: string;
  budget: number;
  advance: number;
  expense: number;
  startDate: Date;
  endDate: Date;
  createdById: string;
  owner: { id: string; name: string; email: string };
  members: { id: string; name: string; email: string }[];
  tags?: TagProps[];
  subtasks?: TaskProps[];
  emojis: string[];
}

export interface FilterTasks {
  searchTerm: string;
  category: TagProps[];
  sort: 'stDate_asc' | 'stDate_desc' | 'endDate_asc' | 'endDate_desc';
}
