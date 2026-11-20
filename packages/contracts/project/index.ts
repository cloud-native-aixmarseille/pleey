import type { Permissions } from '../shared/primitives/index.ts';

export type ProjectId = string & { readonly __identifierBrand: 'ProjectId' };

export const ProjectPermissionReason = {
  UNAVAILABLE: 'PERMISSION_UNAVAILABLE',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  CANNOT_DELETE_LAST_PROJECT: 'CANNOT_DELETE_LAST_PROJECT',
} as const;
export type ProjectPermissionReason = (typeof ProjectPermissionReason)[keyof typeof ProjectPermissionReason];

export type ProjectPermissions = Permissions<{
  update: ProjectPermissionReason;
  delete: ProjectPermissionReason;
}>;

export function hasNonBlankProjectName(value: string): boolean {
  return value.trim().length > 0;
}

export function normalizeProjectName(value: string): string {
  return value.trim();
}
