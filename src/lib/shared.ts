export interface CommentBoxProp {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: Date;
  isDelete: boolean;
  editTime: Date | null;
}

export interface Status {
  value: string;
  label: string;
  icon: string;
}

export interface TaskManageMentProp {
  task_id: string;
}

export const BASE_SOCKET =
  process.env.NODE_ENV === 'production'
    ? 'wss://cusw-workspace.sa.chula.ac.th/socket/'
    : 'ws://localhost:3001/socket/';

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'http://cusw-workspace.sa.chula.ac.th/api'
    : 'https://localhost:4000/api';

export default BASE_URL;
