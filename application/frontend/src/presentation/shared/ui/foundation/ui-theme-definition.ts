import {
  Checkbox,
  createTheme,
  type MantineThemeOverride,
  NativeSelect,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { cyberArcadeThemeSeed } from './cyber-arcade-theme';
import { solarGridThemeSeed } from './solar-grid-theme';
import {
  DEFAULT_UI_COLOR_SCHEME,
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

function createFieldInputComponentStyle(
  tokens: ResolvedUiThemeTokens,
  options?: {
    readonly minHeight?: string;
    readonly resize?: 'none' | 'vertical';
  },
) {
  return (_theme: MantineThemeOverride, props: { readonly size?: string }) => ({
    input: {
      background: tokens.color.surface.field,
      border: `1px solid ${tokens.color.border.subtle}`,
      borderRadius: tokens.radius.field,
      color: tokens.color.text.primary,
      padding: props.size === 'sm' ? '0.35rem 0.6rem' : '0.9rem 1rem',
      transition: [
        `border-color ${tokens.motion.quick}`,
        `box-shadow ${tokens.motion.quick}`,
        `background-color ${tokens.motion.quick}`,
      ].join(', '),
      width: '100%',
      ...(options?.minHeight ? { minHeight: options.minHeight } : null),
      ...(options?.resize ? { resize: options.resize } : null),

      '&[aria-invalid="true"]': {
        borderColor: tokens.color.border.danger,
      },

      '&:focus, &:focus-within': {
        borderColor: tokens.color.border.accent,
        boxShadow: tokens.shadow.focusRing,
        outline: 'none',
      },

      '&::placeholder': {
        color: tokens.color.text.quiet,
      },

      '&:disabled': {
        background: tokens.color.surface.neutralMuted,
        color: tokens.color.text.quiet,
        cursor: 'not-allowed',
      },
    },
    root: {
      width: '100%',
    },
  });
}

function createCheckboxComponentStyles(tokens: ResolvedUiThemeTokens) {
  return {
    description: {
      color: tokens.color.text.soft,
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: 400,
      lineHeight: 1.4,
      marginLeft: 0,
      marginTop: '0.25rem',
    },
    input: {
      accentColor: tokens.color.brand.primary,
      background: tokens.color.surface.field,
      borderColor: tokens.color.border.subtle,
      borderRadius: tokens.radius.field,
      cursor: 'pointer',
      height: '1.25rem',
      marginTop: '0.25rem',
      minWidth: '1.25rem',
      transition: [
        `border-color ${tokens.motion.quick}`,
        `box-shadow ${tokens.motion.quick}`,
        `background-color ${tokens.motion.quick}`,
      ].join(', '),
      width: '1.25rem',

      '&:checked': {
        background: tokens.color.brand.primary,
        borderColor: tokens.color.brand.primary,
        boxShadow: `0 0 0 4px ${tokens.color.surface.accentMuted}`,
      },

      '&:focus, &:focus-within': {
        boxShadow: tokens.shadow.focusRing,
        outline: 'none',
      },

      '&:disabled': {
        background: tokens.color.surface.neutralMuted,
        borderColor: tokens.color.border.subtle,
        cursor: 'not-allowed',
        opacity: 0.5,
      },
    },
    label: {
      color: tokens.color.text.primary,
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    root: {
      alignItems: 'flex-start',
      display: 'flex',
      gap: tokens.spacing.sm,
    },
  };
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
      Checkbox: Checkbox.extend({
        defaultProps: {
          radius: 'md',
          size: 'md',
        },
        styles: createCheckboxComponentStyles(tokens),
      }),
      NativeSelect: {
        ...NativeSelect.extend({
          defaultProps: {
            radius: 'xl',
            size: 'md',
          },
          styles: createFieldInputComponentStyle(tokens),
        }),
      },
      Paper: {
        defaultProps: {
          radius: 'xl',
        },
      },
      TextInput: TextInput.extend({
        defaultProps: {
          radius: 'xl',
          size: 'md',
        },
        styles: createFieldInputComponentStyle(tokens),
      }),
      Textarea: Textarea.extend({
        defaultProps: {
          radius: 'xl',
          size: 'md',
        },
        styles: createFieldInputComponentStyle(tokens, {
          minHeight: '7.5rem',
          resize: 'vertical',
        }),
      }),
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
      sm: tokens.shadow.subtle,
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
