import type { ProjectRole, TaskRole } from '@/app/types/types';
import BASE_URL from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';

interface UserRoleResponse {
  userName: string | undefined;
  isAdmin: boolean;
}

export async function getUserRole(): Promise<UserRoleResponse> {
  const auth = getCookie('auth')?.toString();
  if (!auth) return { userName: undefined, isAdmin: false };

  try {
    const decoded = jwtDecode<{ id: string }>(auth);
    const userId = decoded.id;

    const response = await fetch(`${BASE_URL}/v2/users/${userId}`, {
      headers: { Authorization: auth },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user role');
    }

    const { name, admin } = await response.json();
    return {
      userName: name || undefined,
      isAdmin: Boolean(admin),
    };
  } catch (error) {
    console.error('Error fetching user role:', error);
    return { userName: undefined, isAdmin: false };
  }
}

// Types for better type safety
interface ProjectData {
  id: string;
  role: ProjectRole;
  tasks?: TaskData[];
}

interface TaskData {
  taskId: string;
  taskRole: TaskRole;
}

interface UserRoleProjectTaskResponse {
  userId: string | undefined;
  role: ProjectRole | TaskRole | undefined;
  isAdmin: boolean;
}

export async function getUserRoleOnProjectTask({
  projectId,
  taskId,
}: {
  projectId: string;
  taskId?: string;
}): Promise<UserRoleProjectTaskResponse> {
  const auth = getCookie('auth')?.toString();
  if (!auth) return { userId: undefined, role: undefined, isAdmin: false };

  try {
    const decoded = jwtDecode<{ id: string }>(auth);
    const response = await fetch(`${BASE_URL}/v2/users/userrole/${decoded.id}`, {
      headers: { Authorization: auth },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`Failed to fetch user role: ${response.status}`);

    const data: { projects: ProjectData[]; isAdmin: boolean } = await response.json();
    const project = data.projects.find((p) => p.id === projectId);

    if (!project) return { userId: decoded.id, role: undefined, isAdmin: data.isAdmin };

    const taskRole = taskId && project.tasks?.find((t) => t.taskId === taskId)?.taskRole;

    return {
      userId: decoded.id,
      role: taskRole || project.role || 'Member',
      isAdmin: data.isAdmin,
    };
  } catch (error) {
    console.error('getUserRoleOnProjectTask failed:', error);
    return { userId: undefined, role: undefined, isAdmin: false };
  }
}
