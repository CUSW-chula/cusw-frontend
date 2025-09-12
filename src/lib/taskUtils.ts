import type { TagProps, TaskProps } from '@/app/types/types';
import { getCookie } from 'cookies-next';
import BASE_URL from './shared';
import { useToast } from '@/hooks/use-toast';

type DATE = {
  year: number;
  month: number;
  day: number;
};

type csvDataType = {
  index: string;
  title: string;
  startDate?: DATE;
  endDate?: DATE;
  doneDate?: DATE;
  budget: number;
  expense: number;
  remaining: number;
};
export const useExportTask = () => {
  const { toast } = useToast();
  const exportAsFile = (tasks: TaskProps[]) => {
    try {
      // Converts CSV data array to a CSV string format
      const convertToCSV = (item: csvDataType[]) => {
        // const header = ['ลำดับที่', 'รายการ', 'ปีเริ่มต้น', 'เดือนเริ่มต้น', 'วันเริ่มต้น', 'ปีสิ้นสุด', 'เดือนสิ้นสุด', 'วันสิ้นสุด', 'ปีเสร็จสิ้น', 'เดือนเสร็จสิ้น', 'วันเสร็จสิ้น', 'งบประมาณที่ได้รับอนุมัติ ', 'เบิกจ่ายจริง', 'คงเหลือ'];
        // Main headers
        const mainHeaders = [
          'ลำดับที่',
          'รายการ',
          'เริ่มต้น',
          '',
          '',
          'สิ้นสุด',
          '',
          '',
          'เสร็จสิ้น',
          '',
          '',
          'งบประมาณที่ได้รับอนุมัติ',
          'เบิกจ่ายจริง',
          'คงเหลือ',
        ];

        // Sub-headers
        const subHeaders = [
          '',
          '', // Empty for first two columns
          'วัน',
          'เดือน',
          'ปี', // Sub-headers for start date
          'วัน',
          'เดือน',
          'ปี', // Sub-headers for end date
          'วัน',
          'เดือน',
          'ปี', // Sub-headers for done date
          '',
          '',
          '', // Empty for last three columns
        ];

        const rows = item.map((item) => {
          return [
            item.index,
            item.title,
            item.startDate?.day,
            item.startDate?.month,
            item.startDate?.year,
            item.endDate?.day,
            item.endDate?.month,
            item.endDate?.year,
            item.doneDate?.day,
            item.doneDate?.month,
            item.doneDate?.year,
            item.budget,
            item.expense,
            item.remaining,
          ];
        });

        return [mainHeaders, subHeaders, ...rows].map((row) => row.join(',')).join('\n');
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
      const recursiveGenerateCSVData = (task: TaskProps, indexData: string): csvDataType[] => {
        // Base case: If there are no subtasks, return an empty array
        if (!task.subtasks || task.subtasks.length === 0) return [];

        let csvData: csvDataType[] = [];
        for (const subtask of task.subtasks) {
          totalRemainingBudget -= subtask.expense;
          const index = `${indexData}.${task.subtasks.indexOf(subtask) + 1}`;

          // Push the current subtask's formatted data into the CSV array
          csvData.push({
            index: index,
            title: subtask.title,
            startDate: getDateTime(subtask.startDate),
            endDate: getDateTime(subtask.endDate),
            doneDate: getDateTime(subtask.doneAt),
            budget: subtask.budget,
            expense: subtask.expense,
            remaining: totalRemainingBudget,
          });
          // Recursively process subtasks and append results

          csvData = csvData.concat(recursiveGenerateCSVData(subtask, index));
        }

        return csvData;
      };

      // create a function get date time from task and return year, month, day in DATE type
      const getDateTime = (date: Date | null): DATE | undefined => {
        if (!date) return undefined;
        console.log('getDateTime', date, date.getFullYear(), date.getMonth() + 1, date.getDate());
        return {
          year: date.getFullYear(),
          month: date.getMonth() + 1, // Months are zero-based in JavaScript
          day: date.getDate(),
        };
      };

      let csvData: csvDataType[] = [];
      let totalRemainingBudget = 0;
      let indexData = 0;

      for (const task of tasks) {
        totalRemainingBudget += task.budget;
        totalRemainingBudget -= task.expense;
        indexData++;

        csvData.push({
          index: indexData.toString(),
          title: task.title,
          startDate: getDateTime(task.startDate),
          endDate: getDateTime(task.endDate),
          doneDate: getDateTime(task.doneAt),
          budget: task.budget,
          expense: task.expense,
          remaining: totalRemainingBudget,
        });

        const result =
          // task.budget !== 0 ? [] : recursiveGenerateCSVData(task, indexData.toString());
          task.subtasks ? recursiveGenerateCSVData(task, indexData.toString()) : [];
        csvData = csvData.concat(result);
      }
      const csv = convertToCSV(csvData);
      downloadCSV('budgetReport', csv);
      // Trigger success toast
      toast({
        title: 'Export Successful',
        description: 'The tasks has been exported as a file.',
        variant: 'default',
      });
      return csv;
    } catch (error) {
      console.error('Export failed:', error);
      // Trigger error toast
      toast({
        title: 'Export Failed',
        description: 'An error occurred while exporting the tasks.',
        variant: 'destructive',
      });
    }
  };
  const exportAsTemplate = (tasks: TaskProps[], ids: Set<string>, templateName: string) => {
    try {
      const cookie = getCookie('auth');
      const auth = cookie?.toString() ?? '';
      const filterTasksByIds = (tasks: TaskProps[], ids: Set<string>): TaskProps[] => {
        const taskMap = new Map<string, TaskProps>();

        const traverse = (task: TaskProps) => {
          taskMap.set(task.id, task);
          task.subtasks?.forEach(traverse);
        };

        tasks.forEach(traverse);

        const result: TaskProps[] = [];
        for (const id of ids) {
          const task = taskMap.get(id);
          if (task) {
            result.push(task);
          }
        }

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
        const url = `${BASE_URL}/v2/template/${tasks[0].projectId}`;
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
          if (response.ok) {
            // Trigger success toast
            toast({
              title: 'Export Successful',
              description: 'The tasks has been exported as a template.',
              variant: 'default',
            });
          } else if (response.status === 403) {
            toast({
              title: 'Export Failed',
              description: 'Unauthorized access to export the tasks.',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('Error saving template:', error);
        }
      };

      const filteredTasks = filterTasksByIds(tasks, ids);
      const taskTree = buildTaskTree(filteredTasks);
      const jsonData = JSON.stringify(taskTree, null, 2);
      const BOM = '\uFEFF'; // UTF-8 BOM
      const blob = new Blob([BOM + jsonData], { type: 'application/json' });
      const jsonFile = new File([blob], `${templateName}.json`, { type: 'application/json' });
      uploadTemplate(jsonFile);
    } catch (error) {
      // Trigger error toast
      toast({
        title: 'Export Failed',
        description: 'An error occurred while exporting the tasks.',
        variant: 'destructive',
      });
    }
  };
  return { exportAsFile, exportAsTemplate };
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
    doneAt: value.doneAt ? new Date(value.doneAt) : null,
    parentTaskId: value.parentTaskId,
    projectId: value.projectId,
    position: value.position,
    createdById: value.createdById,
    startDate: value.startDate ? new Date(value.startDate) : null,
    endDate: value.endDate ? new Date(value.endDate) : null,
    owner: value.owner,
    members: value.members,
    tags: value.tags,
    subtasks: value.subtasks ? parseJsonValues(value.subtasks) : [],
    emojis: value.emojis,
  }));
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const parseJsonValuesTemplate = (values: any[]): any[] => {
  return values.map((value) => ({
    id: value.id,
    title: value.title,
    description: value.description,
    statusBudget: 'Initial',
    budget: 0,
    advance: 0,
    expense: 0,
    status: 'Unassigned',
    parentTaskId: value.parentTaskId,
    projectId: value.projectId,
    createdById: null,
    startDate: new Date(),
    endDate: new Date(),
    members: [],
    tags: value.tags,
    subtasks: value.subtasks ? parseJsonValuesTemplate(value.subtasks) : [],
    emojis: [],
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
  { status: 'InRecheck', displayName: 'In recheck', icon: ICONS.InRecheck },
  { status: 'UnderReview', displayName: 'Under review', icon: ICONS.UnderReview },
  { status: 'Done', displayName: 'Done', icon: ICONS.Done },
];

export const statusSectionsWorkload = [
  { status: 'Unassigned', displayName: 'Unassigned', icon: ICONS.Unassigned },
  { status: 'Assigned', displayName: 'Assigned', icon: ICONS.Assigned },
  { status: 'InRecheck', displayName: 'In recheck', icon: ICONS.InRecheck },
  { status: 'UnderReview', displayName: 'Under review', icon: ICONS.UnderReview },
  { status: 'Done', displayName: 'Done', icon: ICONS.Done },
];

export const statusToInt = (status: string): number => {
  const statusMap: { [key: string]: number } = {
    Unassigned: 1,
    Assigned: 2,
    InRecheck: 3,
    UnderReview: 4,
    Done: 5,
  };
  return statusMap[status] || -1;
};

export const groupingStatus = (task: TaskProps, max: number): number => {
  let currentMax = Math.min(max, statusToInt(task.status));
  if (task.subtasks) {
    for (const subtask of task.subtasks) {
      currentMax = Math.min(currentMax, groupingStatus(subtask, currentMax));
    }
  }
  return currentMax;
};
