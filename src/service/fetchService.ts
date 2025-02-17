export const fetchData = async (
  url: string,
  method: string,
  body: object,
  auth: string,
  errorMessage: string,
) => {
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
