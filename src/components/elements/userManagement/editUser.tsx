'use client';
import type React from 'react';
import { useEffect, useState } from 'react';
import BASE_URL, { type User } from '@/lib/shared';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { EllipsisVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { getCookie } from 'cookies-next';
import { toast } from '@/hooks/use-toast';
import { AutocompleteWithCreate } from '@/components/ui/autocomplete-with-create';

export interface UserData {
  id: string;
  userName: string;
  role: string;
  organization: string;
  position: string;
  outsource?: boolean;
  activated?: boolean;
}

interface UserEditDialogProps {
  user: User[];
  initialData: UserData;
  onSave: (data: UserData) => void;
  children?: React.ReactNode;
}

export const UserEditDialog = ({ user, initialData, onSave }: UserEditDialogProps) => {
  const cookie = getCookie('auth');
  const auth = cookie?.toString() ?? '';
  const [openEditor, setOpenEditor] = useState(false);

  const [formData, setFormData] = useState<UserData>(initialData);
  const [allOrganizations, setAllOrganizations] = useState<string[]>([]);
  const [allPositions, setAllPositions] = useState<string[]>([]);

  useEffect(() => {
    const setAllOrganizationAndPosition = (data: User[]) => {
      const organizations = new Set<string>();
      const positions = new Set<string>();
      for (const u of data) {
        if (u.organization) organizations.add(u.organization);
        if (u.position) positions.add(u.position);
      }
      setAllOrganizations(Array.from(organizations));
      setAllPositions(Array.from(positions));
    };
    setAllOrganizationAndPosition(user);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: keyof UserData, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url_information = `${BASE_URL}/v2/users/${initialData.id}`;
      const options_information = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({
          name: formData.userName,
          organization: formData.organization,
          position: formData.position,
          isOutsource: formData.outsource,
        }),
      };

      const url_admin = `${BASE_URL}/v2/users/role/${initialData.id}`;
      const options_admin = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({
          isAdmin: formData.role === 'Admin',
        }),
      };

      const url_head = `${BASE_URL}/v2/users/head/${initialData.id}`;
      const options_head = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({
          isHead: formData.role === 'Head',
        }),
      };

      const url_activate = `${BASE_URL}/v2/users/activate/${initialData.id}`;
      const options_activate = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({
          isActive: formData.activated,
        }),
      };

      const [inforResponse, actResponse, adminResponse, headResponse] = await Promise.all([
        fetch(url_information, options_information),
        fetch(url_activate, options_activate),
        fetch(url_admin, options_admin),
        fetch(url_head, options_head),
      ]);

      if (!inforResponse.ok || !actResponse.ok || !adminResponse.ok || !headResponse.ok) {
        throw new Error('Failed to update data');
      }

      onSave(formData);
      toast({
        title: 'Success',
        description: `User ${formData.userName} updated successfully!`,
        variant: 'default',
      });
      setOpenEditor(false);
    } catch (error) {
      console.error('Failed to update user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={openEditor} onOpenChange={setOpenEditor}>
      <DialogTrigger asChild>
        <EllipsisVertical className="cursor-pointer h-5 w-5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-left">User Name</Label>
            <Input
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-left">
              Role
            </Label>
            <Select
              name="role"
              value={formData.role}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}>
              <SelectTrigger className="col-span-3">
                <span className="text-sm">{formData.role || 'Select Role'}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">
                  <span className="text-sm">Admin</span>
                </SelectItem>
                <SelectItem value="User">
                  <span className="text-sm">User</span>
                </SelectItem>
                <SelectItem value="Head">
                  <span className="text-sm">Head</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="organization" className="text-left">
              Organization
            </Label>
            <AutocompleteWithCreate
              options={allOrganizations}
              value={formData.organization}
              onChange={(value) => setFormData((prev) => ({ ...prev, organization: value }))}
              placeholder="Select organization..."
              createLabel="Add new organization"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-left">
              Position
            </Label>
            <AutocompleteWithCreate
              options={allPositions}
              value={formData.position}
              onChange={(value) => setFormData((prev) => ({ ...prev, position: value }))}
              placeholder="Select position..."
              createLabel="Add new position"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="outsource" className="text-left">
              Outsource
            </Label>
            <div className="col-span-3">
              <Switch
                id="outsource"
                checked={formData.outsource}
                onCheckedChange={(checked) => handleSwitchChange('outsource', checked)}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="activated" className="text-left">
              Activated
            </Label>
            <div className="col-span-3">
              <Switch
                id="activated"
                checked={formData.activated}
                onCheckedChange={(checked) => handleSwitchChange('activated', checked)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
