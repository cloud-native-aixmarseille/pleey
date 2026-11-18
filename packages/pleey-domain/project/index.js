export const ProjectPermissionReason = {
  UNAVAILABLE: 'PERMISSION_UNAVAILABLE',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  CANNOT_DELETE_LAST_PROJECT: 'CANNOT_DELETE_LAST_PROJECT',
};

export function hasNonBlankProjectName(value) {
  return value.trim().length > 0;
}

export function normalizeProjectName(value) {
  return value.trim();
}
