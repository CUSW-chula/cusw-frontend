import type { PermissionContext } from '@/app/types/types';
import { taskPermission } from './taskPermission';
import { projectPermission } from './projectPermission';

type AllPermissions = typeof taskPermission & typeof projectPermission;

export function can<T extends keyof AllPermissions>(
  action: T,
  ctx: PermissionContext,
): ReturnType<AllPermissions[T]> {
  const allPermissions = { ...taskPermission, ...projectPermission };
  return allPermissions[action](ctx) as ReturnType<AllPermissions[T]>;
}
