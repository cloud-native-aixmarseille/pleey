import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { IdentifierParserErrorCode } from '../../../../shared/errors/identifier-parser-error-code';
import { OrganizationIdentifier } from './organization-identifier';

const organizationIdentifier = new OrganizationIdentifier();

describe('OrganizationIdentifier', () => {
  it('parses a UUIDv7 raw value into an organization id', () => {
    const identifier = uuidv7();

    expect(organizationIdentifier.parse(identifier)).toBe(identifier);
  });

  it('returns null for invalid raw input via parseOrNull', () => {
    expect(organizationIdentifier.parseOrNull('not-a-uuid')).toBeNull();
    expect(organizationIdentifier.parseOrNull('')).toBeNull();
  });

  it('returns null when the raw value is blank', () => {
    expect(organizationIdentifier.parse('')).toBeNull();
  });

  it('throws when the raw value is not numeric', () => {
    expect(() => organizationIdentifier.parse('not-a-uuid')).toThrow(
      IdentifierParserErrorCode.INVALID_VALUE,
    );
  });
});
