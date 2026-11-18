export const OrganizationRole = {
  OWNER: 'owner',
  MANAGER: 'manager',
  MEMBER: 'member',
};

export const OrganizationPermissionReason = {
  UNAVAILABLE: 'PERMISSION_UNAVAILABLE',
  NOT_A_MEMBER: 'NOT_A_MEMBER',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  CANNOT_REMOVE_LAST_OWNER: 'CANNOT_REMOVE_LAST_OWNER',
};

export function hasNonBlankOrganizationName(value) {
  return value.trim().length > 0;
}

export function normalizeOrganizationName(value) {
  return value.trim();
}
