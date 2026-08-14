import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { IdentifierParserErrorCode } from '../../../../../domains/shared/errors/identifier-parser-error-code';
import { OrganizationIdentifier } from './organization-identifier';

const organizationIdentifier = new OrganizationIdentifier();

describe('OrganizationIdentifier', () => {
  it('parses a UUIDv7 raw value into an organization id', () => {
    // Arrange + Act
    const identifier = uuidv7();

    // Assert
    expect(organizationIdentifier.parse(identifier)).toBe(identifier);
  });

  it('returns null for invalid raw input via parseOrNull', () => {
    // Arrange + Act + Assert
    expect(organizationIdentifier.parseOrNull('not-a-uuid')).toBeNull();
    expect(organizationIdentifier.parseOrNull('')).toBeNull();
  });

  it('returns null when the raw value is blank', () => {
    // Arrange + Act + Assert
    expect(organizationIdentifier.parse('')).toBeNull();
  });

  it('throws when the raw value is not numeric', () => {
    // Arrange + Act + Assert
    expect(() => organizationIdentifier.parse('not-a-uuid')).toThrow(IdentifierParserErrorCode.INVALID_VALUE);
  });
});
