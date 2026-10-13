import { describe, expect, it } from 'vitest';
import { IdentifierParserErrorCode } from '../../../../domain/shared/errors/identifier-parser-error-code';
import { ThemeIdentifier } from './theme-identifier';

describe('ThemeIdentifier', () => {
  describe.each(['parse', 'parseOrNull'] as const)('%s', (method) => {
    it.each(['cyber-arcade', 'solar-grid', 'custom:01900000-0000-7000-8000-000000000001'])(
      'parses the supported theme %s',
      (value) => {
        // Arrange
        const identifier = new ThemeIdentifier();

        // Act
        const result = identifier[method](value);

        // Assert
        expect(result).toBe(value);
      },
    );

    it('trims surrounding whitespace', () => {
      // Arrange
      const identifier = new ThemeIdentifier();

      // Act
      const result = identifier[method]('  solar-grid  ');

      // Assert
      expect(result).toBe('solar-grid');
    });

    it.each([null, undefined, '', '   '])('returns null for empty input %j', (value) => {
      // Arrange
      const identifier = new ThemeIdentifier();

      // Act
      const result = identifier[method](value);

      // Assert
      expect(result).toBeNull();
    });
  });

  it.each([
    'unsupported',
    'SOLAR-GRID',
    'custom:invalid',
    'custom:01900000-0000-4000-8000-000000000001',
    42,
    {},
    ['solar-grid'],
  ])('rejects invalid input %j via parse', (value) => {
    // Arrange
    const identifier = new ThemeIdentifier();

    // Act + Assert
    expect(() => identifier.parse(value)).toThrow(IdentifierParserErrorCode.INVALID_VALUE);
  });

  it.each([
    'unsupported',
    'SOLAR-GRID',
    'custom:invalid',
    'custom:01900000-0000-4000-8000-000000000001',
    42,
    {},
    ['solar-grid'],
  ])('returns null for invalid input %j via parseOrNull', (value) => {
    // Arrange
    const identifier = new ThemeIdentifier();

    // Act
    const result = identifier.parseOrNull(value);

    // Assert
    expect(result).toBeNull();
  });
});
