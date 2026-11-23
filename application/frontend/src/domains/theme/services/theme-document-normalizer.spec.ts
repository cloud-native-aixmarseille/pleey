import { describe, expect, it } from 'vitest';
import { ThemeFixtureFactory } from '../../../test-utils/fixtures/theme-fixture-factory';
import { ThemeErrorCode } from '../errors/theme-error';
import { ThemeDocumentNormalizer } from './theme-document-normalizer';

const fixtures = new ThemeFixtureFactory();
describe('ThemeDocumentNormalizer', () => {
  it('normalizes partial overrides and discards unknown keys', () => {
    // Arrange
    const normalizer = new ThemeDocumentNormalizer();
    const input = {
      ...fixtures.createDocument(),
      name: ' Meetup ',
      scripts: 'ignored',
      overrides: { radius: { panel: '12px', unknown: 'ignored' }, css: 'ignored' },
    };
    // Act
    const document = normalizer.normalize(input);
    // Assert
    expect(document).toEqual(fixtures.createDocument({ overrides: { radius: { panel: '12px' } } }));
  });
  it.each([2, '1', null])('rejects unsupported schema version %s', (schemaVersion) => {
    // Arrange
    const normalizer = new ThemeDocumentNormalizer();
    // Act + Assert
    expect(() => normalizer.normalize({ ...fixtures.createDocument(), schemaVersion })).toThrow();
  });
  it.each([
    { semantic: { dark: { surface: { canvas: 'url(https://example.com)' } } } },
    { semantic: { dark: { text: { primary: '#ffffff;display:none' } } } },
    { radius: { panel: '-1px' } },
    { spacing: { md: '100vw' } },
    { spacing: { md: '100rem' } },
    { motion: { quick: '501ms' } },
    { typography: { body: 'unapproved font' } },
    { assets: { logoAssetId: 'https://example.com/logo.svg' } },
    { colorScales: { accent: ['#ffffff'] } },
  ])('rejects values outside the token allowlist: %j', (overrides) => {
    // Arrange
    const normalizer = new ThemeDocumentNormalizer();
    // Act + Assert
    expect(() => normalizer.normalize({ ...fixtures.createDocument(), overrides })).toThrow();
  });
  it.each(['light', 'dark'])('rejects unreadable text in %s mode', (scheme) => {
    // Arrange
    const normalizer = new ThemeDocumentNormalizer();
    const document = fixtures.createDocument({
      overrides: { semantic: { [scheme]: { surface: { canvas: '#ffffff' }, text: { primary: '#ffffff' } } } },
    });
    // Act + Assert
    expect(() => normalizer.normalize(document)).toThrow(
      expect.objectContaining({ code: ThemeErrorCode.INVALID_DOCUMENT }),
    );
  });
  it('rejects an indistinguishable focus indicator', () => {
    // Arrange
    const normalizer = new ThemeDocumentNormalizer();
    const document = fixtures.createDocument({ overrides: { semantic: { dark: { border: { accent: '#130c25' } } } } });
    // Act + Assert
    expect(() => normalizer.normalize(document)).toThrow();
  });
  it('rejects an invisible brand highlight', () => {
    // Arrange
    const normalizer = new ThemeDocumentNormalizer();
    const document = {
      ...fixtures.createDocument(),
      overrides: { colorScales: { highlight: Array(10).fill('#12091f') } },
    };
    // Act + Assert
    expect(() => normalizer.normalize(document)).toThrow();
  });
  it('retains safe typography, motion and hosted asset references', () => {
    // Arrange
    const normalizer = new ThemeDocumentNormalizer();
    const document = fixtures.createDocument({
      overrides: {
        typography: { body: 'Georgia, serif' },
        motion: { quick: '0ms' },
        assets: { logoAssetId: '01900000-0000-7000-8000-000000000001', backgroundAssetId: null },
      },
    });
    // Act
    const result = normalizer.normalize(document);
    // Assert
    expect(result).toEqual(document);
  });
});
