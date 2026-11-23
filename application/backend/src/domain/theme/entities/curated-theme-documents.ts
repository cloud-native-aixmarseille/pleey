import type { CuratedThemeId, ThemeDocument } from '@pleey/domain/theme';

export const CURATED_THEME_DOCUMENTS = {
  'cyber-arcade': { schemaVersion: 1, baseThemeId: 'cyber-arcade', name: 'Cyber Arcade', overrides: {} },
  'solar-grid': { schemaVersion: 1, baseThemeId: 'solar-grid', name: 'Solar Grid', overrides: {} },
} as const satisfies Readonly<Record<CuratedThemeId, ThemeDocument>>;
