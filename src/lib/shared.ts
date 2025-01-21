export interface CommentBoxProp {
  id: string;
  content: string;
  taskId: string;
  name: string;
  createdAt: Date;
  isDelete: boolean;
  editTime: Date | null;
}

export interface Status {
  value: string;
  label: string;
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
};

export type Tag = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
} | null;

export const BASE_SOCKET =
  process.env.NODE_ENV === 'production'
    ? 'wss://cusw-workspace.sa.chula.ac.th/socket/'
    : 'ws://localhost:3001/socket';

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://cusw-workspace.sa.chula.ac.th/api'
    : 'http://localhost:4000/api';

export default BASE_URL;
