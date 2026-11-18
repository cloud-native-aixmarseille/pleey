import { ThemeDocumentNormalizerCore } from '@pleey/domain/theme';
import {
  THEME_BORDER_KEYS,
  THEME_FONT_FAMILIES,
  THEME_MOTION_KEYS,
  THEME_RADIUS_KEYS,
  THEME_SPACING_KEYS,
  THEME_SURFACE_KEYS,
  THEME_TEXT_KEYS,
  THEME_TYPOGRAPHY_KEYS,
  type ThemeDocument,
  type ThemeOverrides,
} from '../entities/theme-document';
import { CURATED_THEME_IDS } from '../entities/theme-id';
import { ThemeError, ThemeErrorCode } from '../errors/theme-error';
import { CURATED_THEME_PALETTES } from './curated-theme-palettes';

export class ThemeDocumentNormalizer {
  private readonly core = new ThemeDocumentNormalizerCore({
    curatedThemeIds: CURATED_THEME_IDS,
    curatedThemePalettes: CURATED_THEME_PALETTES,
    keys: {
      border: THEME_BORDER_KEYS,
      fontFamilies: THEME_FONT_FAMILIES,
      motion: THEME_MOTION_KEYS,
      radius: THEME_RADIUS_KEYS,
      spacing: THEME_SPACING_KEYS,
      surface: THEME_SURFACE_KEYS,
      text: THEME_TEXT_KEYS,
      typography: THEME_TYPOGRAPHY_KEYS,
    },
    invalid: (field) => {
      throw new ThemeError(ThemeErrorCode.INVALID_DOCUMENT, { field });
    },
  });

  normalize(value: unknown): ThemeDocument {
    return this.core.normalize(value) as ThemeDocument & { readonly overrides: ThemeOverrides };
  }
}
