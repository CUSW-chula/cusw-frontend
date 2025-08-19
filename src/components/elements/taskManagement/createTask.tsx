import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';

import BASE_URL, { type Project } from '@/lib/shared';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

export const CreateTask = ({ project }: { project: Project }) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const router = useRouter();
  const handleCreateTask = async () => {
    // ใช้วันที่ของ project เป็น default สำหรับ task ใหม่
    const taskStartDate = project.startDate ? new Date(project.startDate) : new Date();
    const taskEndDate = project.endDate ? new Date(project.endDate) : new Date();

    const url = `${BASE_URL}/v2/tasks/${project.id}`;
    const options = {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '',
        description: '',
        budget: 0,
        advance: 0,
        parentTaskId: '',
        expense: 0,
        statusBudgets: 'Initial',
        status: 'Unassigned',
        startDate: taskStartDate,
        endDate: taskEndDate,
      }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      router.push(`/tasks/${data.id}`);
      toast({
        title: 'Task Created Successfully',
        description: 'Your task has been created and saved successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Task Creation Failed',
        description: 'There was an issue creating your task. Please try again.',
        variant: 'default',
      });
    }
  };
  return (
    <Button
      variant="outline"
      onClick={handleCreateTask}
      className="border-brown font-BaiJamjuree text-sm rounded-md gap-1">
      <Plus className="text-brown" />
      <span className="text-brown text-sm font-BaiJamjuree font-normal">New task</span>
    </Button>
  );
};
