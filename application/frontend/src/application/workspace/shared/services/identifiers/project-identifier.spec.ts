import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { IdentifierParserErrorCode } from '../../../../shared/errors/identifier-parser-error-code';
import { ProjectIdentifier } from './project-identifier';

const projectIdentifier = new ProjectIdentifier();

describe('ProjectIdentifier', () => {
  it('parses a UUIDv7 project id from raw input', () => {
    const identifier = uuidv7();

    expect(projectIdentifier.parse(identifier)).toBe(identifier);
  });

  it('returns null for invalid raw input via parseOrNull', () => {
    expect(projectIdentifier.parseOrNull('not-a-uuid')).toBeNull();
    expect(projectIdentifier.parseOrNull('')).toBeNull();
  });

  it('returns null for empty raw input and throws for invalid raw input', () => {
    expect(projectIdentifier.parse('')).toBeNull();
    expect(() => projectIdentifier.parse('not-a-uuid')).toThrow(
      IdentifierParserErrorCode.INVALID_VALUE,
    );
  });
});
