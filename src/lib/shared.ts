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
  startDate: Date | null;
  endDate: Date | null;
  createdById: string;
  owner: User[];
  members: User[];
  tags: Tag[];
  isPinned: boolean;
  updatedAt: Date | null;
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
  updatedAt: Date | null;
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
  isProject: boolean;
};

export type User = {
  id: string;
  email: string;
  name: string;
  admin: boolean;
  head: boolean;
  activated: boolean;
  organization: string;
  position: string;
  isOutsource: boolean;
};

export type UserWorkload = {
  userId: string;
  name: string;
  startDateUser: Date | null;
  endDateUser: Date | null;
  metrics: {
    taskCount: number;
    rechecked: number;
    breakdown: {
      assigned: number;
      inRecheck: number;
      underReview: number;
      done: number;
      perAssigned: number;
      perInRecheck: number;
      perUnderReview: number;
      perDone: number;
    };
  };
  projects: {
    id: string;
    title: string;
    startDate: Date | null;
    endDate: Date | null;
    tags: string[];
    tasks: {
      taskId: string;
      name: string;
      acceptanceStatus: string;
      taskStatus: string;
      rechecked: number;
    }[];
  }[];
};

const isDev =
  process.env.IS_DEV === 'true' || process.env.IS_DEV === '1' || process.env.IS_DEV === 'yes';

export const BASE_SOCKET = isDev
  ? 'wss://dev-cusw-workspace.sa.chula.ac.th/socket'
  : 'wss://cusw-workspace.sa.chula.ac.th/socket';

const BASE_URL = isDev
  ? 'https://dev-cusw-workspace.sa.chula.ac.th/api'
  : 'https://cusw-workspace.sa.chula.ac.th/api';

export const BASE_YSWEET = isDev
  ? 'http://localhost:4001/yjs/auth'
  : 'https://cusw-workspace.sa.chula.ac.th/yjs/auth';

export default BASE_URL;
