import { describe, expect, it } from 'vitest';
import { ActionPermissionReason } from '../value-objects/action-permission';
import { decodeActionPermission } from './action-permission-decoder';

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
    const decision = decodeActionPermission(value, ['DENIED']);
    // Assert
    expect(decision).toEqual({ allowed: false, reason: ActionPermissionReason.UNAVAILABLE });
  });

  it.each([
    { allowed: true, reason: null },
    { allowed: false, reason: 'DENIED' },
  ])('preserves a valid decision and its reason %j', (value) => {
    // Arrange + Act
    const decision = decodeActionPermission(value, ['DENIED']);
    // Assert
    expect(decision).toEqual(value);
  });
});
