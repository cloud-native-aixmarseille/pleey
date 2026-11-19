export { ThemeDocumentNormalizerCore } from './theme-document-normalizer-core.ts';
export { CURATED_THEME_PALETTES } from './curated-theme-palettes.ts';
export { CYBER_ARCADE_THEME_PALETTE } from './cyber-arcade-theme-palette.ts';
export { SOLAR_GRID_THEME_PALETTE } from './solar-grid-theme-palette.ts';

export const CURATED_THEME_IDS = ['cyber-arcade', 'solar-grid'] as const;
export type CuratedThemeId = (typeof CURATED_THEME_IDS)[number];
export type ThemeId = CuratedThemeId | `custom:${string}`;
export const DEFAULT_THEME_ID = 'cyber-arcade' as const;
export const THEME_ID_PATTERN =
  /^(?:cyber-arcade|solar-grid|custom:[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/;

export const THEME_ASSET_POLICY: {
  readonly acceptedMimeTypes: readonly string[];
  readonly maxFileSizeBytes: 5_242_880;
  readonly maxInputPixels: 16_000_000;
} = {
  acceptedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  maxFileSizeBytes: 5_242_880,
  maxInputPixels: 16_000_000,
} as const;

export const THEME_FONT_FAMILIES = [
  'system-ui, sans-serif',
  'ui-monospace, monospace',
  'Georgia, serif',
] as const;
export const THEME_RADIUS_KEYS = ['field', 'inset', 'panel', 'pill'] as const;
export const THEME_SPACING_KEYS = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'] as const;
export const THEME_MOTION_KEYS = ['emphasis', 'modal', 'quick', 'reveal', 'standard'] as const;
export const THEME_TYPOGRAPHY_KEYS = ['body', 'display', 'mono', 'overline'] as const;
export const THEME_SURFACE_KEYS = [
  'accentMuted',
  'accentPanel',
  'canvas',
  'danger',
  'field',
  'live',
  'neutralMuted',
  'overlay',
  'panel',
  'recessed',
  'strongAccent',
  'warning',
] as const;
export const THEME_TEXT_KEYS = [
  'danger',
  'emphasis',
  'link',
  'live',
  'onAction',
  'primary',
  'quiet',
  'secondary',
  'soft',
  'status',
  'statusSoft',
  'warning',
] as const;
export const THEME_BORDER_KEYS = [
  'accent',
  'danger',
  'info',
  'live',
  'strong',
  'subtle',
  'success',
  'warning',
] as const;

export type ThemeColorScale = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export interface ThemeSemanticOverrides {
  readonly surface?: Partial<Record<(typeof THEME_SURFACE_KEYS)[number], string>>;
  readonly text?: Partial<Record<(typeof THEME_TEXT_KEYS)[number], string>>;
  readonly border?: Partial<Record<(typeof THEME_BORDER_KEYS)[number], string>>;
}

export interface ThemeOverrides {
  readonly colorScales?: Partial<Record<'accent' | 'highlight' | 'success', ThemeColorScale>>;
  readonly semantic?: Partial<Record<'light' | 'dark', ThemeSemanticOverrides>>;
  readonly radius?: Partial<Record<(typeof THEME_RADIUS_KEYS)[number], string>>;
  readonly spacing?: Partial<Record<(typeof THEME_SPACING_KEYS)[number], string>>;
  readonly motion?: Partial<Record<(typeof THEME_MOTION_KEYS)[number], string>>;
  readonly typography?: Partial<Record<(typeof THEME_TYPOGRAPHY_KEYS)[number], string>>;
  readonly assets?: {
    readonly logoAssetId?: string | null;
    readonly backgroundAssetId?: string | null;
  };
}

export interface ThemeDocument {
  readonly schemaVersion: 1;
  readonly baseThemeId: CuratedThemeId;
  readonly name: string;
  readonly overrides: ThemeOverrides;
}

export interface SharedThemePalette {
  readonly colorScales: Readonly<{
    accent: readonly string[];
    highlight: readonly string[];
    success: readonly string[];
  }>;
  readonly semantic: Readonly<{
    light: Readonly<{
      surface: Readonly<Record<string, string>>;
      text: Readonly<Record<string, string>>;
      border: Readonly<Record<string, string>>;
    }>;
    dark: Readonly<{
      surface: Readonly<Record<string, string>>;
      text: Readonly<Record<string, string>>;
      border: Readonly<Record<string, string>>;
    }>;
  }>;
}
