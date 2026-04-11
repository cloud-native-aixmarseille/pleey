import { describe, expect, it } from 'vitest';
import { IdentifierParserErrorCode } from '../../../../../shared/errors/identifier-parser-error-code';
import { PartyPinIdentifier } from './party-pin-identifier';

const partyPinIdentifier = new PartyPinIdentifier();

describe('PartyPinIdentifier', () => {
  it('normalizes valid raw input when parsing', () => {
    expect(partyPinIdentifier.parseOrNull(' ab12 ')).toBe(partyPinIdentifier.parse('AB12'));
  });

  it('returns null for invalid raw input via parseOrNull', () => {
    expect(partyPinIdentifier.parseOrNull('')).toBeNull();
    expect(partyPinIdentifier.parseOrNull(42)).toBeNull();
  });

  it('throws for invalid raw input via parse', () => {
    expect(() => partyPinIdentifier.parse(42)).toThrow(IdentifierParserErrorCode.INVALID_VALUE);
  });
});
