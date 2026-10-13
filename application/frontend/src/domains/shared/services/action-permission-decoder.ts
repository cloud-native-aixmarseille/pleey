import type { ActionPermission } from '../value-objects/action-permission';

export function decodeActionPermission<Reason extends string>(
  value: unknown,
  reasons: Readonly<Record<string, Reason>> & { readonly UNAVAILABLE: Reason },
): ActionPermission<Reason> {
  if (typeof value === 'object' && value !== null && 'allowed' in value && 'reason' in value) {
    if (value.allowed === true && value.reason === null) return { allowed: true, reason: null };
    if (
      value.allowed === false &&
      typeof value.reason === 'string' &&
      Object.values(reasons).includes(value.reason as Reason)
    ) {
      return { allowed: false, reason: value.reason as Reason };
    }
  }
  return { allowed: false, reason: reasons.UNAVAILABLE };
}
