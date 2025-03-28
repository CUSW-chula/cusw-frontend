'use client';
import React, { useEffect, useState } from 'react';
import BASE_URL, { type Tag } from '@/lib/shared';
import { toast } from '@/hooks/use-toast';
import { getCookie } from 'cookies-next';
import Delete from './delete';
import Manage from './manage';
import { Searchbar } from '../control-bar';
import Rename from './rename';
import Create from './create';
const Table = () => {
  const [searchTag, setSearchTag] = useState('');
  const [tag, setTag] = useState<Tag[]>([]);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  useEffect(() => {
    const fetchTag = async () => {
      const response = await fetch(`${BASE_URL}/v2/tags`, {
        headers: { Authorization: auth },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        toast({
          title: `🚨 Error ${response.status}: ${response.statusText}`,
          description: `🔥 error: ${errorMessage || 'An unexpected error occurred.'}🗂️ file: user-table.tsx`,
          variant: 'default',
        });
      }
      const data = await response.json();
      console.log(data);
      setTag(data);
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }
    };
    fetchTag();
  }, [auth]);

  const filteredUsers = tag
    .filter((tag) => tag.name.toLowerCase().includes(searchTag.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="font-BaiJamjuree w-full h-[690px] bg-white p-4 rounded-lg border border-brown">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">All Users</h2>
          <p className="text-sm text-green">Account Management</p>
        </div>
        <div className="flex items-center gap-2 justify-between flex-wrap">
          <Searchbar onSearchChange={setSearchTag} placeholder="Search tag..." />
          <Create />
        </div>
      </div>
      <div className="overflow-y-auto max-h-[600px]">
        <table className="w-full border-collapse relative">
          <thead className="sticky top-0 bg-neutral-100 z-10">
            <tr className="border-b text-gray-700">
              <th className="p-3 text-left w-[80%]">Tag</th>
              <th className="p-3 text-left">IsProject</th>
              <th className="p-3 text-left">Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((tag) => (
              <tr key={tag.id} className="border-b text-black">
                <td className="p-2">
                  <Rename tag={tag} />
                </td>
                <td className="p-2">
                  <Manage tag={tag} />
                </td>
                <td className="p-2">
                  <Delete tag={tag} />
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
