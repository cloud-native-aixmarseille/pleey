import { describe, expect, it } from 'vitest';
import { IdentifierParserErrorCode } from '../../../../../../domains/shared/errors/identifier-parser-error-code';
import { PartyPinIdentifier } from './party-pin-identifier';

const partyPinIdentifier = new PartyPinIdentifier();

describe('PartyPinIdentifier', () => {
  it('normalizes valid raw input when parsing', () => {
    // Arrange + Act + Assert
    expect(partyPinIdentifier.parseOrNull(' ab12 ')).toBe(partyPinIdentifier.parse('AB12'));
  });

  it('returns null for invalid raw input via parseOrNull', () => {
    // Arrange + Act + Assert
    expect(partyPinIdentifier.parseOrNull('')).toBeNull();
    expect(partyPinIdentifier.parseOrNull(42)).toBeNull();
  });

  it('throws for invalid raw input via parse', () => {
    // Arrange + Act + Assert
    expect(() => partyPinIdentifier.parse(42)).toThrow(IdentifierParserErrorCode.INVALID_VALUE);
  });
});
