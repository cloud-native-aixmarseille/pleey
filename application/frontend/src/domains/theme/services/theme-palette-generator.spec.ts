import { describe, expect, it } from 'vitest';
import { ThemeFixtureFactory } from '../../../test-utils/fixtures/theme-fixture-factory';
import { ThemeDocumentNormalizer } from './theme-document-normalizer';
import { ThemePaletteGenerator } from './theme-palette-generator';

const fixtures = new ThemeFixtureFactory();
describe('ThemePaletteGenerator', () => {
  it.each([
    '#7952e8',
    '#256bdb',
    '#227667',
    '#b04767',
    '#bf632b',
    '#55516a',
    '#000000',
    '#ffffff',
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
  ])('generates valid action and highlight colors from %s in both starters', (color) => {
    // Arrange
    const generator = new ThemePaletteGenerator();
    const normalizer = new ThemeDocumentNormalizer();
    const documents = (['cyber-arcade', 'solar-grid'] as const).map((baseThemeId) =>
      fixtures.createDocument({ baseThemeId }),
    );
    // Act
    const results = documents.map((document) =>
      generator.apply(generator.apply(document, 'accent', color), 'highlight', color),
    );
    // Assert
    for (const document of results) expect(normalizer.normalize(document)).toEqual(document);
  });

  it('preserves unrelated overrides and only adjusts action foregrounds with a primary palette', () => {
    // Arrange
    const document = fixtures.createDocument({
      overrides: {
        radius: { panel: '23px' },
        typography: { body: 'Georgia, serif' },
        semantic: { light: { text: { primary: '#111111' } } },
      },
    });
    // Act
    const result = new ThemePaletteGenerator().apply(document, 'accent', '#123456');
    // Assert
    expect(result.overrides).toMatchObject({
      radius: document.overrides.radius,
      typography: document.overrides.typography,
      semantic: {
        light: { text: { primary: '#111111', onAction: '#ffffff' } },
        dark: { text: { onAction: '#000000' } },
      },
    });
    expect(document.overrides.colorScales).toBeUndefined();
  });

  it('rejects malformed colors before producing a document', () => {
    // Arrange
    const generator = new ThemePaletteGenerator();
    // Act + Assert
    expect(() => generator.apply(fixtures.createDocument(), 'accent', 'red;display:none')).toThrow(
      'Invalid theme document.',
    );
  });
});
