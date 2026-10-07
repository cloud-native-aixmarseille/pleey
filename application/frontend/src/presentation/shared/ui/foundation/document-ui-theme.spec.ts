import { describe, expect, it } from 'vitest';
import { CURATED_THEME_PALETTES } from '../../../../domains/theme/services/curated-theme-palettes';
import { ThemeFixtureFactory } from '../../../../test-utils/fixtures/theme-fixture-factory';
import { createUiThemeFromDocument } from './document-ui-theme';
import { uiThemes } from './ui-theme-definition';

describe('UI themes from documents', () => {
  it.each(['cyber-arcade', 'solar-grid'] as const)(
    'preserves the curated %s tokens with empty overrides',
    (baseThemeId) => {
      // Arrange
      const document = new ThemeFixtureFactory().createDocument({ baseThemeId });

      // Act
      const result = createUiThemeFromDocument(document);

      // Assert
      expect(result.tokensByColorScheme).toEqual(
        uiThemes.find((theme) => theme.id === baseThemeId)?.tokensByColorScheme,
      );
    },
  );
  it('keeps the validation baseline synchronized with both curated seeds', () => {
    // Arrange + Act + Assert
    for (const theme of uiThemes) {
      const baseline = CURATED_THEME_PALETTES[theme.id as keyof typeof CURATED_THEME_PALETTES];
      expect(theme.seed.colorScales).toEqual(baseline.colorScales);
      for (const scheme of ['light', 'dark'] as const)
        for (const group of ['surface', 'text', 'border'] as const)
          expect(theme.seed.semantic[scheme][group]).toEqual(baseline.semantic[scheme][group]);
    }
  });
  it('merges individual tokens while keeping inherited tokens in both modes', () => {
    // Arrange
    const document = new ThemeFixtureFactory().createDocument({
      baseThemeId: 'solar-grid',
      overrides: { radius: { panel: '12px' }, semantic: { dark: { border: { accent: '#ffffff' } } } },
    });
    // Act
    const result = createUiThemeFromDocument(document);
    // Assert
    expect(result.tokensByColorScheme.dark.radius.panel).toBe('12px');
    expect(result.seed.semantic.dark.shadow.focusRing).toBe('0 0 0 3px #ffffff');
    expect(result.seed.semantic.light).toEqual(uiThemes[1].seed.semantic.light);
    expect(result.seed.semantic.dark.text).toEqual(uiThemes[1].seed.semantic.dark.text);
  });
});
