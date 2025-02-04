import type { TaskProps } from '@/app/types/types';
import { getCookie } from 'cookies-next';
import BASE_URL from './shared';
export const exportAsFile = (tasks: TaskProps[]) => {
  const sumBudget = (task: TaskProps): { budget: number; expense: number } => {
    let budget = task.budget;
    let expense = task.expense;
    if (task.subtasks && task.subtasks.length > 0) {
      for (const subtask of task.subtasks) {
        const { budget: subBudget, expense: subExpense } = sumBudget(subtask);
        budget += subBudget;
        expense += subExpense;
      }
    }
    return { budget, expense };
  };

  const toCSV = (
    tasks: { title: string; budget: number; expense: number; remaining: number }[],
  ) => {
    const header = ['ลำดับที่', 'รายการ', 'งบประมาณที่ได้รับอนุมัติ ', 'เบิกจ่ายจริง', 'คงเหลือ'];
    const rows = tasks.map((task, index) => [
      index + 1,
      task.title,
      task.budget,
      task.expense,
      task.budget - task.expense,
    ]);
    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    return csv;
  };

  const downloadBudgetReport = (filename: string, text: string) => {
    const blob = new Blob([text], { type: 'text/csv;charset=UTF-8' });
    const a = document.createElement('a');
    a.download = `${filename}.csv`;
    const url = URL.createObjectURL(blob);
    a.href = url;
    const TIMEOUT_DURATION = 30 * 1000;
    a.addEventListener('click', () => {
      setTimeout(() => URL.revokeObjectURL(url), TIMEOUT_DURATION);
    });
    a.click();
  };

  const data: { title: string; budget: number; expense: number; remaining: number }[] = [];
  for (const task of tasks) {
    const { budget, expense } = sumBudget(task);
    data.push({ title: task.title, budget: budget, expense: expense, remaining: budget - expense });
  }
  const csv = toCSV(data);
  downloadBudgetReport('budgetReport', csv);
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
