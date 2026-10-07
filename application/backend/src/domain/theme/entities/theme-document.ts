import type { CuratedThemeId } from './theme-id';

export const THEME_FONT_FAMILIES = ['system-ui, sans-serif', 'ui-monospace, monospace', 'Georgia, serif'] as const;
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
type ThemeColorScale = readonly [string, string, string, string, string, string, string, string, string, string];
interface ThemeSemanticOverrides {
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
  readonly assets?: { readonly logoAssetId?: string | null; readonly backgroundAssetId?: string | null };
}
export interface ThemeDocument {
  readonly schemaVersion: 1;
  readonly baseThemeId: CuratedThemeId;
  readonly name: string;
  readonly overrides: ThemeOverrides;
}
