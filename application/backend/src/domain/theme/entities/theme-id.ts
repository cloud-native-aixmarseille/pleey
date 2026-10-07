export const CURATED_THEME_IDS = ['cyber-arcade', 'solar-grid'] as const;

export type CuratedThemeId = (typeof CURATED_THEME_IDS)[number];
export type ThemeId = CuratedThemeId | `custom:${string}`;

export const DEFAULT_THEME_ID: CuratedThemeId = 'cyber-arcade';

export const THEME_ID_PATTERN =
  /^(?:cyber-arcade|solar-grid|custom:[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/;
