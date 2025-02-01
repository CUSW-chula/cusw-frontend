import type { TaskProps } from '@/app/types/types';
import { useState } from 'react';

export const useTaskState = () => {
  const [isSelectTaskClicked, setIsSelectTaskClicked] = useState<boolean>(false);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());
  const [visibleExportTasks, setVisibleExportTasks] = useState<Set<string>>(new Set());
  const [exportedTasks, setExportedTasks] = useState<TaskProps[]>([]);

  return {
    isSelectTaskClicked,
    setIsSelectTaskClicked,
    expandedTaskIds,
    setExpandedTaskIds,
    visibleExportTasks,
    setVisibleExportTasks,
    exportedTasks,
    setExportedTasks,
  };
};

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
    const header = ['Task Title', 'Budget', 'Expense', 'Remaining'];
    const rows = tasks.map((task) => [
      task.title,
      task.budget,
      task.expense,
      task.budget - task.expense,
    ]);
    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    return csv;
  };

  const downloadBudgetReport = (filename: string, text: string) => {
    const blob = new Blob([text], { type: 'text/csv' });
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
  console.log('task');
  console.log(tasks.map((task) => task.title));
  console.log('ids');
  console.log(ids);
  const filterTreeByIds = (task: TaskProps, ids: Set<string>): TaskProps | null => {
    if (!ids.has(task.id)) {
      const filteredSubtasks = (task.subtasks || [])
        .map((subtask) => filterTreeByIds(subtask, ids))
        .filter(Boolean) as TaskProps[];

      if (filteredSubtasks.length > 0) {
        return { ...task, subtasks: filteredSubtasks };
      }
      return null;
    }
    return {
      ...task,
      subtasks: (task.subtasks || [])
        .map((subtask) => filterTreeByIds(subtask, ids))
        .filter(Boolean) as TaskProps[],
    };
  };
  const filteredTasks = tasks
    .map((task) => filterTreeByIds(task, ids))
    .filter(Boolean) as TaskProps[];
  console.log('filteredTasks', filteredTasks);
};
