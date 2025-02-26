import { fetchData } from '@/service/fetchService';
import { fetchTemplate } from './templateService';
import type { FormInput } from '@/app/types/createProjectType';
import BASE_URL from '@/lib/shared';

export const createSingleTask = async (projectId: string, inputs: FormInput, BASE_URL: string) => {
  const taskPayload = {
    title: inputs.taskTitle,
    description: inputs.taskDescription ?? '',
    budget: 0,
    advance: 0,
    expense: 0,
    status: 'Unassigned',
    parentTaskId: '',
    startDate: null,
    endDate: null,
  };

  return await fetchData(`${BASE_URL}/v2/tasks/${projectId}`, 'POST', taskPayload, 'Error creating task');
};

export const createTasksFromTemplate = async (
  projectId: string,
  inputs: FormInput,
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

export const addTaskBudget = async (taskId: string, inputs: FormInput) => {
  const payload = {
    taskID: taskId,
    budget: inputs.taskBudget,
    advance: inputs.taskAdvance,
    expense: inputs.taskExpense,
  };

  await fetchData(`${BASE_URL}/v2/tasks/money/`, 'POST', payload, 'Error adding task money');
};
