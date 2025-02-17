import { fetchData } from '@/service/fetchService';
import type { FormInput } from '@/app/types/createProjectType';

export const createProject = async (inputs: FormInput, auth: string, BASE_URL: string) => {
  const projectPayload = {
    title: inputs.projectTitle,
    description: inputs.projectDescription ?? '',
    startDate: new Date(),
    endDate: new Date(),
  };

  return await fetchData(`${BASE_URL}/v2/projects`, 'POST', projectPayload, 'Create Project Fail');
};

export const getProjectOwner = async (userId: string, auth: string, BASE_URL: string) => {
  try {
    return await fetchData(
      `${BASE_URL}/v2/users/${userId}`,
      'GET',
      {},
      'Get User From Server Fail.',
    );
  } catch (error) {
    console.error('Error fetching template:', error);
  }
};

export const assignProjectTag = async (
  projectId: string,
  inputs: FormInput,
  auth: string,
  BASE_URL: string,
) => {};
