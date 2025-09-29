'use client';
import React, { useEffect, useState } from 'react';
import { Searchbar } from '../control-bar';
import Adduser from './add-user';
import BASE_URL, { type User } from '@/lib/shared';
import { getCookie } from 'cookies-next';
import { UserEditDialog, type UserData } from './editUser';
const Table = () => {
  const [searchUser, setSearchUser] = useState('');
  const [user, setUser] = useState<User[]>([]);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  const heading = [
    'User Name',
    'Role',
    'Email',
    'Organization',
    'Position',
    'Hiring',
    'Status',
    ' ',
  ];

  // ดึงข้อมูล user จาก backend
  const fetchUser = React.useCallback(async () => {
    const response = await fetch(`${BASE_URL}/v2/users/`, {
      headers: { Authorization: auth },
    });
    const data = await response.json();
    setUser(data);
    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid data format received');
    }
  }, [auth]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const filteredUsers = user
    .filter((user) => user.name.toLowerCase().includes(searchUser.toLowerCase()))
    .sort((a, b) => {
      // เรียงให้ Active มาก่อน จากนั้นเรียงตามชื่อ (A->Z)
      if (a.activated === b.activated) return a.name.localeCompare(b.name);
      return a.activated ? -1 : 1; // a ก่อนถ้า a.active = true
    });

  return (
    <div className="font-BaiJamjuree w-full h-[690px] bg-white p-4 rounded-lg border border-brown">
      {' '}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">All Users</h2>
          <p className="text-sm text-green">Account Management</p>
        </div>
        <div className="flex items-center gap-2 justify-between flex-wrap">
          <Searchbar onSearchChange={setSearchUser} placeholder="Search user..." />
          <Adduser />
        </div>
      </div>
      <div className="overflow-y-auto max-h-[600px]">
        <table className="w-full border-collapse relative">
          <thead className="sticky top-0 bg-neutral-100 z-10">
            <tr className="border-b text-gray-700">
              {heading.map((head) => (
                <th key={head} className="p-3 text-left">
                  <span className="font-semibold">{head}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-b text-gray-900">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.admin ? 'Admin' : u.head ? 'Head' : 'User'}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.organization}</td>
                <td className="p-3">{u.position}</td>
                <td className="p-3">{u.isOutsource ? 'Outsource' : 'Employee'}</td>
                <td className="p-3">{u.activated ? 'Active' : 'Inactive'}</td>
                <td className="pr-3">
                  <UserEditDialog
                    user={user}
                    initialData={{
                      id: u.id,
                      userName: u.name,
                      role: u.admin ? 'Admin' : u.head ? 'Head' : 'User',
                      organization: u.organization,
                      position: u.position,
                      outsource: u.isOutsource,
                      activated: u.activated,
                    }}
                    onSave={async (data) => {
                      // สามารถส่ง request ไป backend เพื่ออัพเดท user ได้ที่นี่
                      // หลังอัพเดทเสร็จ ให้รีเฟรชข้อมูล user ใหม่
                      await fetchUser();
                    }}
                  />
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
