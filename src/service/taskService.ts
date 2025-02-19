import { fetchData } from '@/service/fetchService';
import { fetchTemplate } from './templateService';
import type { FormInput } from '@/app/types/createProjectType';

export const createSingleTask = async (
  projectId: string,
  inputs: FormInput,
  auth: string,
  BASE_URL: string,
) => {
  const taskPayload = {
    title: inputs.taskTitle,
    description: inputs.taskDescription ?? '',
    budget: inputs.taskBudget ?? 0,
    advance: inputs.taskAdvance ?? 0,
    expense: inputs.taskExpense ?? 0,
    status: 'Unassigned',
    parentTaskId: '',
    projectId,
    startDate: new Date(),
    endDate: new Date(),
  };

  await fetchData(`${BASE_URL}/v2/tasks/`, 'POST', taskPayload, 'Error creating task');
};

export const createTasksFromTemplate = async (
  projectId: string,
  inputs: FormInput,
  auth: string,
  BASE_URL: string,
) => {
  try {
    if (!inputs.task) throw new Error('Please select template.');
    const templateFormat = await fetchTemplate(inputs.task.template.filePath);
    if (templateFormat) {
      console.log(templateFormat);
      await fetchData(
        `${BASE_URL}/v2/tasks/template/${projectId}`,
        'POST',
        templateFormat,
        'Error creating tasks with template',
      );
    }
  } catch (error) {
    console.error('Error fetching or posting template:', error);
  }
};
