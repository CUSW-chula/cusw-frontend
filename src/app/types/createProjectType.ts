export interface FormInput {
  projectTitle?: string;
  projectDescription?: string;
  // projectTag?: any[];
  taskTitle?: string;
  taskDescription?: string;
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
