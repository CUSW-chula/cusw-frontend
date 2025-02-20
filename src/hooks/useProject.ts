import { assignProjectTag, createProject } from '@/service/projectService';
import { createSingleTask, createTasksFromTemplate } from '@/service/taskService';
import type { FormInput } from '@/app/types/createProjectType';
import { useRouter } from 'next/navigation';
import { toast } from './use-toast';

export const useCreateProject = (inputs: FormInput, BASE_URL: string) => {
  const router = useRouter();
  const handleProjectCreation = async (typeCreation: string) => {
    try {
      const projectRes = await createProject(inputs, BASE_URL);
      if (!projectRes?.id) {
        console.error('Project ID not found', projectRes);
        return;
      }
      if (inputs.taskTitle && typeCreation === 'newTaskForm')
        await createSingleTask(projectRes.id, inputs, BASE_URL);
      else if (typeCreation === 'newTaskwithTemplate')
        await createTasksFromTemplate(projectRes.id, inputs, BASE_URL);
      if (inputs.projectTag) await assignProjectTag(projectRes.id, inputs, BASE_URL);

      toast({
        title: 'Project Created Successfully',
        description: 'Your project has been created and saved successfully.',
        variant: 'default',
      });
      router.push('/projects');
      return projectRes;
    } catch (error) {
      console.error(error);
      toast({
        title: 'Project Creation Failed',
        description: 'There was an issue creating your project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return { handleProjectCreation };
};
