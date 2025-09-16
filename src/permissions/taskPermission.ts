import type { PermissionContext } from '@/app/types/types';

type PermissionKey =
  | 'deleteTask'
  | 'uploadFile'
  | 'deleteFile'
  | 'comment'
  | 'editTitle'
  | 'editDescription'
  | 'editStatus'
  | 'editMember'
  | 'editTag'
  | 'editMoney'
  | 'editDate'
  | 'deleteTag'
  | 'editEmoji'
  | 'createSubtask'
  | 'duplicateTask';

// Helper function สำหรับตรวจสอบสิทธิ์แบบ centralized
const checkPermission = (ctx: PermissionContext, customLogic: () => boolean): boolean => {
  // Admin และ Head มีสิทธิ์ทุกอย่าง
  if (ctx.isAdmin || ctx.isHead) return true;
  return customLogic();
};

export const taskPermission: Record<PermissionKey, (ctx: PermissionContext) => true | false> = {
  editTitle: (ctx) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.taskRole === 'owner') return true;
      if (ctx.taskRole === 'assignee') return true;
      return false;
    }),
  editDescription: (ctx) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.taskRole === 'owner') return true;
      if (ctx.taskRole === 'assignee') return true;
      return false;
    }),
  editEmoji: (ctx) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.taskRole === 'owner') return true;
      if (ctx.taskRole === 'assignee') return true;
      return true;
    }),
  uploadFile: (ctx) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.taskRole === 'owner') return true;
      if (ctx.taskRole === 'assignee') return true;
      return false;
    }),
  deleteFile: (ctx) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.taskRole === 'owner') return true;
      if (ctx.taskRole === 'assignee') return true;
      return false;
    }),
  comment: (ctx) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.taskRole === 'owner') return true;
      if (ctx.taskRole === 'assignee') return true;
      return true;
    }),
  editStatus: (ctx) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.taskRole === 'owner') return true;
      if (ctx.taskRole === 'assignee') return true;
      return false;
    }),
  editMember: (ctx) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.taskRole === 'owner') return true;
      if (ctx.taskRole === 'assignee') return false;
      return false;
    }),
  editTag: (ctx) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.taskRole === 'owner') return true;
      if (ctx.taskRole === 'assignee') return false;
      return false;
    }),
  deleteTag: (ctx) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.taskRole === 'owner') return true;
      if (ctx.taskRole === 'assignee') return false;
      return false;
    }),
  editMoney: (ctx) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.taskRole === 'owner') return true;
      if (ctx.taskRole === 'assignee') return false;
      return false;
    }),
  editDate: (ctx) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.taskRole === 'owner') return true;
      if (ctx.taskRole === 'assignee') return false;
      return false;
    }),
  deleteTask: (ctx) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.taskRole === 'owner') return true;
      if (ctx.taskRole === 'assignee') return false;
      return false;
    }),
  createSubtask: (ctx) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.taskRole === 'owner') return true;
      if (ctx.taskRole === 'assignee') return true;
      return false;
    }),
  duplicateTask: (ctx) =>
    checkPermission(ctx, () => {
      if (ctx.projectRole === 'ProjectOwner') return true;
      if (ctx.taskRole === 'owner') return true;
      if (ctx.taskRole === 'assignee') return true;
      return true;
    }),
};
