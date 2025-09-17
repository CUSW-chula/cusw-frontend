import type { PermissionContext } from '@/app/types/types';

type PermissionKey =
  | 'editProjectTitle'
  | 'editProjectDescription'
  | 'editProjectOwner'
  | 'editProjectMember'
  | 'editProjectTag'
  | 'editProjectDate'
  | 'deleteProject';

// Helper function สำหรับตรวจสอบสิทธิ์แบบ centralized
const checkPermission = (ctx: PermissionContext, customLogic: () => boolean): boolean => {
  // Admin และ Head มีสิทธิ์ทุกอย่าง
  if (ctx.isAdmin || ctx.isHead) return true;
  return customLogic();
};

export const projectPermission: Record<PermissionKey, (ctx: PermissionContext) => true | false> = {
  editProjectTitle: (
    ctx, //disable
  ) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.projectRole === 'Member') return false;
      return false;
    }),
  editProjectDescription: (
    ctx, //disable
  ) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.projectRole === 'Member') return false;
      return false;
    }),
  editProjectOwner: (
    ctx, //disable
  ) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.projectRole === 'Member') return false;
      return false;
    }),
  editProjectMember: (
    ctx, //disable
  ) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.projectRole === 'Member') return false;
      return false;
    }),
  editProjectTag: (
    ctx, //hide
  ) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.projectRole === 'Member') return false;
      return false;
    }),
  editProjectDate: (
    ctx, //disable
  ) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.projectRole === 'Member') return false;
      return false;
    }),
  deleteProject: (
    ctx, //hide
  ) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.projectRole === 'Member') return false;
      return false;
    }),
};
