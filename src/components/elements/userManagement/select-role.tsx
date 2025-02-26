import type React from 'react';
import { useEffect, useState } from 'react';
import BASE_URL, { type User } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { toast } from '@/hooks/use-toast';
interface ManageProps {
  user: User;
}
const SelectRole: React.FC<ManageProps> = ({ user }) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const roles = ['Admin', 'User'];

  const updateisAdmin = async (isAdmin: boolean) => {
    const userid = user.id;
    const url = `${BASE_URL}/v2/users/role/${userid}`;
    const options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify({
        isAdmin: isAdmin,
      }),
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      const errorMessage = await response.text();
      toast({
        title: `🚨 Error ${response.status}: ${response.statusText}`,
        description: `🔥 error: ${errorMessage || 'An unexpected error occurred.'}🗂️ file: select-table.tsx`,
        variant: 'default',
      });
    }
  };

  return (
    <select
      className="rounded px-3 py-1 border w-fit"
      defaultValue={`${user.admin ? 'Admin' : 'User'}`}
      onChange={(e) => updateisAdmin(e.target.value === 'Admin')}>
      {roles.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
};

export default SelectRole;
