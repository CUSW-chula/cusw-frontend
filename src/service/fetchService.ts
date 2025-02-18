import { getCookie } from 'cookies-next';

export const fetchData = async (
  url: string,
  method: string,
  body: object,
  errorMessage: string,
) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
    };

    if (method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`${errorMessage}. Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(errorMessage, error);
  }
};
