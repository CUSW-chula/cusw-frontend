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

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'http://cusw-workspace.sa.chula.ac.th/api'
    : 'http://localhost:4000/api';

export default BASE_URL;
