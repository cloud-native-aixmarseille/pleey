export interface ThemeDocumentNormalizerCoreOptions {
  readonly curatedThemeIds: readonly string[];
  readonly curatedThemePalettes: Record<string, unknown>;
  readonly keys: {
    readonly border: readonly string[];
    readonly fontFamilies: readonly string[];
    readonly motion: readonly string[];
    readonly radius: readonly string[];
    readonly spacing: readonly string[];
    readonly surface: readonly string[];
    readonly text: readonly string[];
    readonly typography: readonly string[];
  };
  readonly invalid: (field: string) => never;
}

export class ThemeDocumentNormalizerCore {
  constructor(options: ThemeDocumentNormalizerCoreOptions);
  normalize(value: unknown): {
    readonly schemaVersion: 1;
    readonly baseThemeId: string;
    readonly name: string;
    readonly overrides: Record<string, unknown>;
  };
}
export const CURATED_THEME_IDS: readonly ['cyber-arcade', 'solar-grid'];

export type CuratedThemeId = (typeof CURATED_THEME_IDS)[number];
export type ThemeId = CuratedThemeId | `custom:${string}`;

export const DEFAULT_THEME_ID: 'cyber-arcade';
export const THEME_ID_PATTERN: RegExp;

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

export const CYBER_ARCADE_THEME_PALETTE: SharedThemePalette;
export const SOLAR_GRID_THEME_PALETTE: SharedThemePalette;
export const CURATED_THEME_PALETTES: Readonly<
  Record<CuratedThemeId, SharedThemePalette>
>;
