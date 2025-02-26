import type React from 'react';
import { useEffect } from 'react';
import BASE_URL, { type User } from '@/lib/shared';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ManageProps {
  user: User;
}

const Manage: React.FC<ManageProps> = ({ user }) => {
  return <Switch checked={user.activated} />;
};

export default Manage;
