import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { IdentifierParserErrorCode } from '../../../../shared/errors/identifier-parser-error-code';
import { ProjectIdentifier } from './project-identifier';

const projectIdentifier = new ProjectIdentifier();

describe('ProjectIdentifier', () => {
  it('builds a branded project id from a UUIDv7 string', () => {
    const identifier = uuidv7();

    expect(projectIdentifier.parse(identifier)).toBe(identifier);
  });

  it('returns null when the input is absent', () => {
    expect(projectIdentifier.parse(undefined)).toBeNull();
  });

  it('returns null for invalid raw input via parseOrNull', () => {
    expect(projectIdentifier.parseOrNull('not-a-uuid')).toBeNull();
    expect(projectIdentifier.parseOrNull('')).toBeNull();
  });

  it('throws for invalid raw input via parse', () => {
    expect(() => projectIdentifier.parse('not-a-uuid')).toThrow(
      IdentifierParserErrorCode.INVALID_VALUE,
    );
  });
});
