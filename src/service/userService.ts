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
