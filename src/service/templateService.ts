import { fetchData } from '@/service/fetchService';

//get all template to show as choices in create project page
export const getAllTemplates = async (auth: string, BASE_URL: string) => {
  try {
    return await fetchData(`${BASE_URL}/v2/template/`, 'GET', {}, 'Get Template From Server Fail.');
  } catch (error) {
    console.error('Error fetching template:', error);
  }
};

//get template data (.json) to create task in form template
export const fetchTemplate = async (filePath: string) => {
  try {
    const response = await fetch(filePath);
    return await response.json();
  } catch (error) {
    console.error('Error fetching template:', error);
  }
};
