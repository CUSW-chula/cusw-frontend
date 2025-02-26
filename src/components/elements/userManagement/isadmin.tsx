import type React from 'react';
import { useEffect, useState } from 'react';
import BASE_URL, { type User } from '@/lib/shared';
import { Switch } from '@/components/ui/switch';
import { getCookie } from 'cookies-next';
import { toast } from '@/hooks/use-toast';

interface ManageProps {
  user: User;
}

const Manage: React.FC<ManageProps> = ({ user }) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [isActivate, setIsActivate] = useState<boolean>(user.activated);

  const updateIsActivate = async (checked: boolean) => {
    const userid = user.id;
    const url = `${BASE_URL}/v2/users/activate/${userid}`;
    const options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({
        isActive: checked,
      }),
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      const errorMessage = await response.text();
      toast({
        title: `🚨 Error ${response.status}: ${response.statusText}`,
        description: `🔥 error: ${errorMessage || 'An unexpected error occurred.'}🗂️ file: isadmin.tsx`,
        variant: 'default',
      });
    }
  };

  return (
    <Switch
      checked={isActivate}
      onCheckedChange={(checked) => {
        setIsActivate(checked);
        updateIsActivate(checked);
      }}
    />
  );
};

export default Manage;
