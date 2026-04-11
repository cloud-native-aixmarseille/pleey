import { describe, expect, it } from 'vitest';
import { IdentifierParserErrorCode } from '../../../../shared/errors/identifier-parser-error-code';
import { ProjectIdentifier } from './project-identifier';

const projectIdentifier = new ProjectIdentifier();

describe('ProjectIdentifier', () => {
  it('builds a branded project id from a number', () => {
    expect(projectIdentifier.parse(8)).toBe(8);
  });

  it('returns null when the input is absent', () => {
    expect(projectIdentifier.parse(undefined)).toBeNull();
  });

  it('returns null for invalid raw input via parseOrNull', () => {
    expect(projectIdentifier.parseOrNull('abc')).toBeNull();
    expect(projectIdentifier.parseOrNull('')).toBeNull();
  });

  it('throws for invalid raw input via parse', () => {
    expect(() => projectIdentifier.parse('abc')).toThrow(IdentifierParserErrorCode.INVALID_VALUE);
  });
});
