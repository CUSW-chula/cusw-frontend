import type { TagProps } from './types';

export interface FormInput {
  projectTitle?: string;
  projectDescription?: string;
  projectTag?: TagProps[];
  taskTitle?: string;
  taskDescription?: string;
  taskBudget?: number;
  taskAdvance?: number;
  taskExpense?: number;
  task?: { template: Template };
}

export type Template = {
  id: string;
  filePath: string;
  fileSize: number;
  fileName: string;
  uploadedBy: string;
  createdAt: Date;
};
