export const PAGINATION_LIMITS = {
  defaultPage: 1,
  defaultPageSize: 9,
  maxPage: 10000,
  maxPageSize: 100,
};

export function decodeActionPermission(value, reasons) {
  if (typeof value === 'object' && value !== null && 'allowed' in value && 'reason' in value) {
    if (value.allowed === true && value.reason === null) {
      return { allowed: true, reason: null };
    }
    if (
      value.allowed === false &&
      typeof value.reason === 'string' &&
      Object.values(reasons).includes(value.reason)
    ) {
      return { allowed: false, reason: value.reason };
    }
  }
  return { allowed: false, reason: reasons.UNAVAILABLE };
}
