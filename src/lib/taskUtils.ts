import type { TagProps, TaskProps } from '@/app/types/types';
import { getCookie } from 'cookies-next';
import BASE_URL from './shared';

type csvDataType = {
  title: string;
  month: string;
  budget: string;
  expense: string;
  remaining: string;
};
export const exportAsFile = (tasks: TaskProps[]) => {
  const moneyToString = (money: number): string => {
    return money === 0 ? '-' : money.toString();
  };

  // Converts CSV data array to a CSV string format
  const convertToCSV = (item: csvDataType[]) => {
    const header = ['ลำดับที่', 'รายการ', 'เดือน', 'งบประมาณที่ได้รับอนุมัติ ', 'เบิกจ่ายจริง', 'คงเหลือ'];
    const rows = item.map((item, index) => [
      index + 1,
      item.title,
      item.month,
      item.budget,
      item.expense,
      item.remaining,
    ]);
    return [header, ...rows].map((row) => row.join(',')).join('\n');
  };

  // Triggers a CSV file download
  const downloadCSV = (filename: string, text: string) => {
    const BOM = '\uFEFF'; // UTF-8 BOM
    const blob = new Blob([BOM + text], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.download = `${filename}.csv`;
    a.href = url;

    const TIMEOUT_DURATION = 30 * 1000;
    a.addEventListener('click', () => {
      setTimeout(() => URL.revokeObjectURL(url), TIMEOUT_DURATION);
    });

    a.click();
  };

  // Recursively generates CSV data from task subtasks
  const recursiveGenerateCSVData = (task: TaskProps, remainingBudget: number): csvDataType[] => {
    // Base case: If there are no subtasks, return an empty array
    if (!task.subtasks || task.subtasks.length === 0) return [];

    let updatedRemaining = remainingBudget;
    let csvData: csvDataType[] = [];

    for (const subtask of task.subtasks) {
      updatedRemaining -= subtask.expense;
      const assignedMonth = subtask.tags ? getTag(subtask.tags) : '-';

      // Push the current subtask's formatted data into the CSV array

      csvData.push({
        title: subtask.title,
        month: assignedMonth,
        budget: '-',
        expense: moneyToString(subtask.expense),
        remaining: updatedRemaining.toString(),
      });
      // Recursively process subtasks and append results

      csvData = csvData.concat(recursiveGenerateCSVData(subtask, updatedRemaining));
    }

    return csvData;
  };

  // Extracts the first matching month tag from a list of tags
  const getTag = (tags: TagProps[]) => {
    const months = new Set([
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม',
    ]);

    const foundTag = tags.find((tag) => months.has(tag.name));
    return foundTag ? foundTag.name : '-';
  };

  let csvData: csvDataType[] = [];
  let totalRemainingBudget = 0;

  for (const task of tasks) {
    const assignedMonth = task.tags ? getTag(task.tags) : '-';
    totalRemainingBudget += task.budget;
    totalRemainingBudget -= task.expense;
    
    csvData.push({
      title: task.title,
      month: assignedMonth,
      budget: moneyToString(task.budget),
      expense: moneyToString(task.expense),
      remaining: moneyToString((totalRemainingBudget)),
    });

    const result = task.budget !== 0 ? [] : recursiveGenerateCSVData(task, totalRemainingBudget);
    csvData = csvData.concat(result);
  }
  const csv = convertToCSV(csvData);
  downloadCSV('budgetReport', csv);
  return csv;
};

export const exportAsTemplate = (tasks: TaskProps[], ids: Set<string>) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const filterTasksByIds = (tasks: TaskProps[], ids: Set<string>): TaskProps[] => {
    const result: TaskProps[] = [];

    const traverse = (task: TaskProps) => {
      if (ids.has(task.id)) {
        result.push(task);
      }
      task.subtasks?.forEach(traverse);
    };

    tasks.forEach(traverse);
    return result;
  };
  const buildTaskTree = (tasks: TaskProps[]): TaskProps[] => {
    const taskMap = new Map<string, TaskProps>();
    const rootTasks: TaskProps[] = [];

    for (const task of tasks) {
      taskMap.set(task.id, { ...task, subtasks: [] });
    }

    for (const task of tasks) {
      const taskEntry = taskMap.get(task.id);
      if (!taskEntry) continue;
      if (task.parentTaskId && taskMap.has(task.parentTaskId)) {
        const parentTask = taskMap.get(task.parentTaskId);
        if (parentTask) parentTask.subtasks?.push(taskEntry);
      } else rootTasks.push(taskEntry);
    }

    return rootTasks;
  };
  const uploadTemplate = async (jsonFile: File) => {
    const url = `${BASE_URL}/v2/template`;
    const formData = new FormData();
    formData.append('file', jsonFile);
    const options = {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: auth,
      },
    };
    try {
      const response = await fetch(url, options);
      await response.json();
      console.log('Save Template success');
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const filteredTasks = filterTasksByIds(tasks, ids);
  const taskTree = buildTaskTree(filteredTasks);
  const jsonData = JSON.stringify(taskTree, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const jsonFile = new File([blob], 'templateName.json', { type: 'application/json' });
  uploadTemplate(jsonFile);
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const parseJsonValues = (values: any[]): TaskProps[] => {
  return values.map((value) => ({
    id: value.id,
    title: value.title,
    description: value.description,
    statusBudget: value.statusBudget,
    budget: value.budget,
    advance: value.advance,
    expense: value.expense,
    status: value.status,
    parentTaskId: value.parentTaskId,
    projectId: value.projectId,
    createdById: value.createdById,
    startDate: new Date(value.startDate),
    endDate: new Date(value.endDate),
    owner: value.owner,
    members: value.members,
    tags: value.tags,
    subtasks: value.subtasks ? parseJsonValues(value.subtasks) : [],
    emojis: value.emojis,
  }));
};

// Predefined icon paths
const ICONS = {
  Unassigned: '/asset/icon/unassigned.svg',
  Assigned: '/asset/icon/assigned.svg',
  InRecheck: '/asset/icon/inrecheck.svg',
  UnderReview: '/asset/icon/underreview.svg',
  Done: '/asset/icon/done.svg',
};

export const statusSections = [
  { status: 'Unassigned', displayName: 'Unassigned', icon: ICONS.Unassigned },
  { status: 'Assigned', displayName: 'Assigned', icon: ICONS.Assigned },
  { status: 'InRecheck', displayName: 'In Recheck', icon: ICONS.InRecheck },
  {
    status: 'UnderReview',
    displayName: 'Under Review',
    icon: ICONS.UnderReview,
  },
  { status: 'Done', displayName: 'Done', icon: ICONS.Done },
];
