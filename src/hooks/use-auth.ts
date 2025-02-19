import { getCookie } from 'cookies-next';

function useAuth() {
  const cookie = getCookie('auth');
  return cookie?.toString() ?? '';
}
export { useAuth };
