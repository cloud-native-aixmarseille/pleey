import { describe, expect, it } from 'vitest';
import { decodeActionPermission } from './action-permission-decoder';

enum TestPermissionReason {
  DENIED = 'DENIED',
  UNAVAILABLE = 'TEST_UNAVAILABLE',
}

describe('decodeActionPermission', () => {
  it.each([
    undefined,
    null,
    {},
    { allowed: true },
    { allowed: false, reason: null },
    { allowed: true, reason: 'DENIED' },
    { allowed: false, reason: 'UNKNOWN' },
    { allowed: 'true', reason: null },
  ])('denies malformed or unknown decision %j', (value) => {
    // Arrange + Act
    const decision = decodeActionPermission(value, TestPermissionReason);
    // Assert
    expect(decision).toEqual({ allowed: false, reason: TestPermissionReason.UNAVAILABLE });
  });

  it.each([
    { allowed: true, reason: null },
    { allowed: false, reason: 'DENIED' },
  ])('preserves a valid decision and its reason %j', (value) => {
    // Arrange + Act
    const decision = decodeActionPermission(value, TestPermissionReason);
    // Assert
    expect(decision).toEqual(value);
  });
});
