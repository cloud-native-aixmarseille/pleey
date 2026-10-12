import { type ActionPermission, ActionPermissionReason } from '../value-objects/action-permission';

export function decodeActionPermission<Reason extends string>(
  value: unknown,
  reasons: readonly Reason[],
): ActionPermission<Reason | ActionPermissionReason> {
  if (typeof value === 'object' && value !== null && 'allowed' in value && 'reason' in value) {
    if (value.allowed === true && value.reason === null) return { allowed: true, reason: null };
    if (value.allowed === false && typeof value.reason === 'string' && reasons.includes(value.reason as Reason)) {
      return { allowed: false, reason: value.reason as Reason };
    }
  }
  return { allowed: false, reason: ActionPermissionReason.UNAVAILABLE };
}
