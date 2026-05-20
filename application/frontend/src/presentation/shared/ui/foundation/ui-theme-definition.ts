import { createTheme, type MantineThemeOverride, Tooltip } from '@mantine/core';
import { cyberArcadeThemeSeed } from './cyber-arcade-theme';
import { solarGridThemeSeed } from './solar-grid-theme';
import {
  DEFAULT_UI_COLOR_SCHEME,
  DEFAULT_UI_THEME_ID,
  type UiColorScheme,
  type UiThemeId,
  type UiThemeSeed,
} from './ui-theme-contract';
import { createUiThemeTokens, type ResolvedUiThemeTokens } from './ui-theme-tokens';

export interface UiThemeDefinition {
  readonly id: UiThemeId;
  readonly mantineTheme: MantineThemeOverride;
  readonly mantineThemes: Record<UiColorScheme, MantineThemeOverride>;
  readonly name: string;
  readonly seed: UiThemeSeed;
  readonly tokens: ResolvedUiThemeTokens;
  readonly tokensByColorScheme: Record<UiColorScheme, ResolvedUiThemeTokens>;
}

function createMantineUiTheme(
  tokens: ResolvedUiThemeTokens,
  seed: UiThemeSeed,
  colorScheme: UiColorScheme,
) {
  return createTheme({
    autoContrast: true,
    black: tokens.color.text.emphasis,
    colors: {
      accent: seed.colorScales.highlight,
      brand: seed.colorScales.accent,
      success: seed.colorScales.success,
    },
    components: {
      Alert: {
        defaultProps: {
          radius: 'xl',
        },
      },
      Button: {
        defaultProps: {
          radius: 'xl',
        },
      },
      NativeSelect: {
        defaultProps: {
          radius: 'xl',
          size: 'md',
        },
      },
      Paper: {
        defaultProps: {
          radius: 'xl',
        },
      },
      TextInput: {
        defaultProps: {
          radius: 'xl',
          size: 'md',
        },
      },
      Textarea: {
        defaultProps: {
          radius: 'xl',
          size: 'md',
        },
      },
      Tooltip: Tooltip.extend({
        defaultProps: {
          radius: 'md',
        },
        styles: {
          tooltip: {
            backdropFilter: 'blur(12px)',
            backgroundColor:
              colorScheme === 'dark' ? 'rgba(30, 20, 50, 0.92)' : 'rgba(255, 255, 255, 0.95)',
            border: `1px solid ${tokens.color.border.subtle}`,
            boxShadow: tokens.shadow.subtle,
            color: tokens.color.text.primary,
          },
        },
      }),
    },
    cursorType: 'pointer',
    defaultRadius: 'xl',
    focusRing: 'auto',
    fontFamily: tokens.typography.bodyFamily,
    fontFamilyMonospace: tokens.typography.monoFamily,
    headings: {
      fontFamily: tokens.typography.displayFamily,
      fontWeight: '800',
    },
    primaryColor: 'brand',
    primaryShade: colorScheme === 'light' ? 6 : 5,
    respectReducedMotion: true,
    shadows: {
      md: tokens.shadow.accentGlow,
      xl: tokens.shadow.elevated,
    },
    spacing: tokens.spacing,
    white: tokens.color.surface.canvas,
  });
}

function createUiThemeDefinition(seed: UiThemeSeed): UiThemeDefinition {
  const tokensByColorScheme = {
    dark: createUiThemeTokens(seed, 'dark'),
    light: createUiThemeTokens(seed, 'light'),
  } satisfies Record<UiColorScheme, ResolvedUiThemeTokens>;
  const mantineThemes = {
    dark: createMantineUiTheme(tokensByColorScheme.dark, seed, 'dark'),
    light: createMantineUiTheme(tokensByColorScheme.light, seed, 'light'),
  } satisfies Record<UiColorScheme, MantineThemeOverride>;

  return {
    id: seed.id,
    mantineTheme: mantineThemes[DEFAULT_UI_COLOR_SCHEME],
    mantineThemes,
    name: seed.name,
    seed,
    tokens: tokensByColorScheme[DEFAULT_UI_COLOR_SCHEME],
    tokensByColorScheme,
  };
}

export const uiThemes = [
  createUiThemeDefinition(cyberArcadeThemeSeed),
  createUiThemeDefinition(solarGridThemeSeed),
] as const;

export function findUiTheme(themeId: UiThemeId): UiThemeDefinition {
  return uiThemes.find((theme) => theme.id === themeId) ?? uiThemes[0];
}

export const defaultUiThemeDefinition = findUiTheme(DEFAULT_UI_THEME_ID);

export const uiTheme = defaultUiThemeDefinition.mantineThemes[DEFAULT_UI_COLOR_SCHEME];
