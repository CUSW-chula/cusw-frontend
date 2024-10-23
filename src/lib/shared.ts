export interface CommentBoxProp {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: Date;
}

export interface Status {
  value: string;
  label: string;
  icon: string;
}
