import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';

import BASE_URL from '@/lib/shared';

export const CreateTask = (project_id: { project_id: string }) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const router = useRouter();
  const handleCreateTask = async () => {
    const url = `${BASE_URL}/tasks/`;
    const options = {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '',
        description: '',
        expectedBudget: 0,
        realBudget: 0,
        parentTaskId: '',
        usedBudget: 0,
        status: 'Unassigned',
        projectId: project_id,
        startDate: new Date(),
        endDate: new Date(),
      }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      router.push(`/tasks/${data.id}`);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Button
      variant="outline"
      onClick={handleCreateTask}
      className="flex items-center text-brown border-brown px-3 py-1 rounded-md">
      + New task
    </Button>
  );
};
