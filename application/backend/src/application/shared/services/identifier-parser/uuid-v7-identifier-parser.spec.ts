import { v4 as uuidv4, v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { IdentifierParserErrorCode } from '../../errors/identifier-parser-error-code';
import { UuidV7IdentifierParser } from './uuid-v7-identifier-parser';

type TestIdentifier = string & {
  readonly __identifierBrand: 'TestIdentifier';
};

class TestUuidV7IdentifierParser extends UuidV7IdentifierParser<TestIdentifier> {
  constructor() {
    super('TestIdentifier');
  }
}

const parser = new TestUuidV7IdentifierParser();

describe('UuidV7IdentifierParser', () => {
  it('builds a branded id from a UUIDv7 string', () => {
    const identifier = uuidv7();

    expect(parser.parse(identifier)).toBe(identifier);
  });

  it('returns null when the input is absent', () => {
    expect(parser.parse(undefined)).toBeNull();
  });

  it('returns null for invalid or non-v7 values via parseOrNull', () => {
    expect(parser.parseOrNull('not-a-uuid')).toBeNull();
    expect(parser.parseOrNull(uuidv4())).toBeNull();
    expect(parser.parseOrNull('')).toBeNull();
  });

  it('throws for invalid raw input via parse', () => {
    expect(() => parser.parse(uuidv4())).toThrow(IdentifierParserErrorCode.INVALID_VALUE);
  });
});
