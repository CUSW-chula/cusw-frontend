'use client';
import React, { useEffect, useState } from 'react';
import { Searchbar } from '../control-bar';
import Adduser from './add-user';
import BASE_URL, { type User } from '@/lib/shared';
import { toast } from '@/hooks/use-toast';
import { getCookie } from 'cookies-next';
import Manage from './isadmin';
import SelectRole from './select-role';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
const Table = () => {
  const [searchUser, setSearchUser] = useState('');
  const [user, setUser] = useState<User[]>([]);
  const [allOrganization, setAllOrganization] = useState<string[]>([]);
  const [allPosition, setAllPosition] = useState<string[]>([]);
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';

  const heading = [
    'User Name',
    'Role',
    'Email',
    'Organization',
    'Position',
    'IsOutsource',
    'IsActivate',
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`${BASE_URL}/v2/users/`, {
        headers: { Authorization: auth },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
      }
      const data = await response.json();
      setUser(data);
      setAllOrganizationAndPosition(data);
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }
    };
    fetchUser();
  }, [auth]);

  const setAllOrganizationAndPosition = (data: User[]) => {
    const organizations = new Set<string>();
    const positions = new Set<string>();
    for (const u of data) {
      if (u.organization) organizations.add(u.organization);
      if (u.position) positions.add(u.position);
    }
    console.log('Organizations:', organizations);
    console.log('Positions:', positions);

    setAllOrganization(Array.from(organizations));
    setAllPosition(Array.from(positions));
  };

  const handleChange = (
    userId: string,
    organization?: string,
    position?: string,
    isOutsource?: boolean,
  ) => {
    // Only include fields that are provided
    const body: Record<string, unknown> = {};
    if (organization !== undefined) body.organization = organization;
    if (position !== undefined) body.position = position;
    if (isOutsource !== undefined) body.isOutsource = isOutsource;

    const updateUser = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: auth,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage);
        }

        const updatedUser = await response.json();
        setUser((prevUsers) => prevUsers.map((u) => (u.id === userId ? { ...u, ...body } : u)));
        toast({ title: 'User updated successfully', description: `Updated ${updatedUser.name}` });
      } catch (error) {
        console.error('Failed to update user:', error);
        toast({
          title: 'Error',
          description: 'Failed to update user. Check console for details.',
          variant: 'destructive',
        });
      }
    };
    updateUser();
  };

  const filteredUsers = user
    .filter((user) => user.name.toLowerCase().includes(searchUser.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const Organization = ({ user }: { user: User }) => {
    return (
      <div>
        <Select
          value={user.organization}
          onValueChange={(organization) => handleChange(user.id, organization)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Organization">
              {user.organization || 'Select Organization'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {allOrganization.map((org) => (
              <SelectItem key={org} value={org}>
                {org}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const Position = ({ user }: { user: User }) => {
    return (
      <div>
        <Select
          value={user.position}
          onValueChange={(position) => handleChange(user.id, undefined, position)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Position">
              {user.position || 'Select Position'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {allPosition.map((pos) => (
              <SelectItem key={pos} value={pos}>
                {pos}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const ManageOutsource = ({ user }: { user: User }) => {
    const [isOutsource, setIsOutsource] = useState(user.isOutsource);
    return (
      <Switch
        checked={isOutsource}
        onCheckedChange={(isOutsource) => {
          setIsOutsource(isOutsource);
          handleChange(user.id, undefined, undefined, isOutsource);
        }}
      />
    );
  };

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
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b text-gray-900">
                <td className="p-3">{user.name}</td>
                <td className="p-3">
                  <SelectRole user={user} />
                </td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <Organization user={user} />
                </td>
                <td className="p-3">
                  <Position user={user} />
                </td>
                <td className="p-3">
                  <ManageOutsource user={user} />
                </td>
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
