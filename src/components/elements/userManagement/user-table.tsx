'use client';
import React, { useEffect, useState } from 'react';
import { Searchbar } from '../control-bar';
import Adduser from './add-user';
import BASE_URL, { type User } from '@/lib/shared';
import { toast } from '@/hooks/use-toast';
import { getCookie } from 'cookies-next';
import Manage from './manage';
const Table = () => {
  const [searchUser, setSearchUser] = useState('');
  const [user, setUser] = useState<User[]>([]);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const roles = ['Admin', 'Director', 'User'];
  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`${BASE_URL}/v2/users`, {
        headers: { Authorization: auth },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        toast({
          title: `🚨 Error ${response.status}: ${response.statusText}`,
          description: `
      🔥 error: ${errorMessage || 'An unexpected error occurred.'}
      
      🗂️ file: user-table.tsx
          `,
          variant: 'default',
        });
      }

      const data = await response.json();
      setUser(data);
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }
    };
    fetchUser();
  });

  const filteredUsers = user.filter((user) =>
    user.name.toLowerCase().includes(searchUser.toLowerCase()),
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">All Users</h2>
          <p className="text-sm text-gray-500">Account Management</p>
        </div>
        <div className="flex items-center gap-2">
          <Searchbar onSearchChange={setSearchUser} />
          <Adduser />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-200 text-gray-700">
              <th className="p-3 text-left">User Name</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Manage</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b text-gray-900">
                <td className="p-3">{user.name}</td>
                <td className="p-3">
                  <select className="rounded px-3 py-1 border w-full" defaultValue={user.name}>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <Manage user={user} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
