import { describe, expect, it, vi } from 'vitest';
import { ThemeDocumentNormalizer } from '../../../../domains/theme/services/theme-document-normalizer';
import { ThemePaletteGenerator } from '../../../../domains/theme/services/theme-palette-generator';
import type { TranslationPort } from '../../../shared/ports/translation.port';
import { ThemeDocumentTemplateFactory } from './theme-document-template.factory';

describe('ThemeDocumentTemplateFactory', () => {
  it('creates an importable exhaustive template with localized comments', () => {
    // Arrange
    const translation: TranslationPort = {
      currentLanguage: 'en',
      changeLanguage: vi.fn(),
      t: (key) => `translated:${key}`,
    };
    const factory = new ThemeDocumentTemplateFactory(new ThemePaletteGenerator(), translation);
    // Act
    const file = factory.create();
    const template = JSON.parse(file.content);
    const document = new ThemeDocumentNormalizer().normalize(template);
    // Assert
    expect(file).toMatchObject({ fileName: 'pleey-theme-template.json', mimeType: 'application/json' });
    expect(template.$comment).toBe('translated:theme.template.root');
    expect(Object.keys(template.overrides)).toEqual(
      expect.arrayContaining(['colorScales', 'semantic', 'radius', 'spacing', 'motion', 'typography', 'assets']),
    );
    expect(document.name).toBe('translated:theme.template.name');
  });
});
