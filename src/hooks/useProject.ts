import { assignProjectTag, createProject } from '@/service/projectService';
import { createSingleTask, createTasksFromTemplate } from '@/service/taskService';
import type { FormInput } from '@/app/types/createProjectType';
import { useRouter } from 'next/navigation';

export const useCreateProject = (inputs: FormInput, auth: string, BASE_URL: string) => {
  const router = useRouter();
  const handleProjectCreation = async () => {
    const projectRes = await createProject(inputs, auth, BASE_URL);
    if (!projectRes?.id) {
      console.error('Project ID not found', projectRes);
      return;
    }

    if (inputs.taskTitle) await createSingleTask(projectRes.id, inputs, auth, BASE_URL);
    else await createTasksFromTemplate(projectRes.id, inputs, auth, BASE_URL);
    if (inputs.projectTag) await assignProjectTag(projectRes.id, inputs, auth, BASE_URL);
    router.push(`/projects/${projectRes.id}`);
    return projectRes;
  };

  return { handleProjectCreation };
};
