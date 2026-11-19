import type { CuratedThemeId } from '@pleey/domain/theme';
import type { ThemeDocument } from './theme-document';

export const CURATED_THEME_DOCUMENTS = {
  'cyber-arcade': { schemaVersion: 1, baseThemeId: 'cyber-arcade', name: 'Cyber Arcade', overrides: {} },
  'solar-grid': { schemaVersion: 1, baseThemeId: 'solar-grid', name: 'Solar Grid', overrides: {} },
} as const satisfies Readonly<Record<CuratedThemeId, ThemeDocument>>;
