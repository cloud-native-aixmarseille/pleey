import { describe, expect, it } from 'vitest';
import { IdentifierParserErrorCode } from '../../../../shared/errors/identifier-parser-error-code';
import { ProjectIdentifier } from './project-identifier';

const projectIdentifier = new ProjectIdentifier();

describe('ProjectIdentifier', () => {
  it('parses a numeric project id from raw input', () => {
    expect(projectIdentifier.parse('21')).toBe(projectIdentifier.parse(21));
  });

  it('returns null for invalid raw input via parseOrNull', () => {
    expect(projectIdentifier.parseOrNull('abc')).toBeNull();
    expect(projectIdentifier.parseOrNull('')).toBeNull();
  });

  it('returns null for empty raw input and throws for invalid raw input', () => {
    expect(projectIdentifier.parse('')).toBeNull();
    expect(() => projectIdentifier.parse('abc')).toThrow(IdentifierParserErrorCode.INVALID_VALUE);
  });
});
