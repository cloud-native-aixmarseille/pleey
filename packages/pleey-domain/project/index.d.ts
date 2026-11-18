import type { Permissions } from '../shared/primitives/index.js';

export type ProjectId = string & {
  readonly __identifierBrand: 'ProjectId';
};

export const ProjectPermissionReason: {
  readonly UNAVAILABLE: 'PERMISSION_UNAVAILABLE';
  readonly INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS';
  readonly CANNOT_DELETE_LAST_PROJECT: 'CANNOT_DELETE_LAST_PROJECT';
};

export type ProjectPermissionReason = (typeof ProjectPermissionReason)[keyof typeof ProjectPermissionReason];

export type ProjectPermissions = Permissions<{
  update: ProjectPermissionReason;
  delete: ProjectPermissionReason;
}>;

export function hasNonBlankProjectName(value: string): boolean;
export function normalizeProjectName(value: string): string;
