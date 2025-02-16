export interface CommentBoxProp {
  id: string;
  content: string;
  taskId: string;
  name: string;
  createdAt: Date;
  isDeleted: boolean;
  editTime: Date | null;
  authorId: string;
}

export interface Status {
  status: string;
  displayName: string;
  icon: string;
}

export interface ProjectTagProp {
  value: string;
  label: string;
}

export interface TaskManageMentProp {
  task_id: string;
}

export interface TaskManageMentOverviewProp {
  project_id: string;
}

export interface ProjectOverviewProps {
  project_id: string;
}

export type Project = {
  id: string;
  title: string;
  description: string;
  budget: number;
  advance: number;
  expense: number;
  startDate: Date;
  endDate: Date;
  createdById: string;
  owner: User[];
  members: User[];
  tags: Tag[];
  isPinned: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
  parentTaskId: string | null;
  projectId: string;
  startDate: Date | null;
  endDate: Date | null;
  expense: number;
  createdById: string | null;
  creator: User | null;
  members: User[];
  tags: Tag[];
  budget: number;
  advance: number;
  subtasks: Task[];
  emojis: Emojis[];
};

export type Emojis = {
  id: string;
  emoji: string;
  taskId: string;
  user: User;
};

export type Tag = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
};

export const BASE_SOCKET =
  process.env.NODE_ENV === 'production'
    ? 'wss://cusw-workspace.sa.chula.ac.th/socket/'
    : 'ws://localhost:3001/socket';

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://cusw-workspace.sa.chula.ac.th/api'
    : 'http://localhost:4000/api';

export default BASE_URL;
