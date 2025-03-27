import type React from 'react';
import { useEffect, useState } from 'react';
import BASE_URL, { type Tag } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { toast } from '@/hooks/use-toast';

interface ManageProps {
  tag: Tag;
}

const Rename: React.FC<ManageProps> = ({ tag }) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [name, setName] = useState<string>(tag.name);

  useEffect(() => {
    const handler = setTimeout(async () => {
      const tagid = tag.id;
      const url = `${BASE_URL}/v2/tags/${tagid}`;
      const options = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({
          name: name,
          isProject: tag.isProject,
        }),
      };

      const response = await fetch(url, options);
      if (!response.ok) {
        const errorMessage = await response.text();
        toast({
          title: `🚨 Error ${response.status}: ${response.statusText}`,
          description: `🔥 error: ${errorMessage || 'An unexpected error occurred.'}🗂️ file: manage.tsx`,
          variant: 'default',
        });
      }
    }, 800);

    return () => clearTimeout(handler);
  }, [name]);

  return (
    <input
      className="w-full h-[40px] px-4 outline-none focus:border-b focus:border-neutral-400"
      value={name}
      onChange={(e) => {
        setName(e.target.value);
      }}
    />
  );
};

export default Rename;
