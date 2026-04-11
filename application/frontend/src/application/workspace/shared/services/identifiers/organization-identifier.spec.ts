import { describe, expect, it } from 'vitest';
import { IdentifierParserErrorCode } from '../../../../shared/errors/identifier-parser-error-code';
import { OrganizationIdentifier } from './organization-identifier';

const organizationIdentifier = new OrganizationIdentifier();

describe('OrganizationIdentifier', () => {
  it('parses a numeric raw value into an organization id', () => {
    expect(organizationIdentifier.parse('15')).toBe(organizationIdentifier.parse(15));
  });

  it('returns null for invalid raw input via parseOrNull', () => {
    expect(organizationIdentifier.parseOrNull('abc')).toBeNull();
    expect(organizationIdentifier.parseOrNull('')).toBeNull();
  });

  it('returns null when the raw value is blank', () => {
    expect(organizationIdentifier.parse('')).toBeNull();
  });

  it('throws when the raw value is not numeric', () => {
    expect(() => organizationIdentifier.parse('abc')).toThrow(
      IdentifierParserErrorCode.INVALID_VALUE,
    );
  });
});
