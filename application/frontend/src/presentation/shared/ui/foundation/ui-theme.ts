import { createTheme, type MantineThemeOverride, Tooltip } from '@mantine/core';
import type { CSSProperties } from 'react';
import { CYBER_ARCADE_THEME_ID, cyberArcadeThemeSeed } from './cyber-arcade-theme';
import { SOLAR_GRID_THEME_ID, solarGridThemeSeed } from './solar-grid-theme';

export const DEFAULT_UI_THEME_ID = CYBER_ARCADE_THEME_ID;
export const UI_COLOR_SCHEMES = ['light', 'dark'] as const;
export const DEFAULT_UI_COLOR_SCHEME = 'dark';

export type UiThemeId = typeof CYBER_ARCADE_THEME_ID | typeof SOLAR_GRID_THEME_ID;
export type UiColorScheme = (typeof UI_COLOR_SCHEMES)[number];

type UiThemeColorScale = readonly [
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

export interface UiThemeSeed {
  readonly colorScales: {
    readonly accent: UiThemeColorScale;
    readonly highlight: UiThemeColorScale;
    readonly success: UiThemeColorScale;
  };
  readonly id: UiThemeId;
  readonly motion: {
    readonly emphasis: string;
    readonly modal: string;
    readonly quick: string;
    readonly reveal: string;
    readonly standard: string;
  };
  readonly name: string;
  readonly radius: {
    readonly field: string;
    readonly inset: string;
    readonly panel: string;
    readonly pill: string;
  };
  readonly semantic: Record<UiColorScheme, UiThemeSemanticTokens>;
  readonly spacing: {
    readonly lg: string;
    readonly md: string;
    readonly sm: string;
    readonly xl: string;
    readonly xs: string;
    readonly xxl: string;
    readonly xxs: string;
    readonly xxxl: string;
  };
  readonly typography: {
    readonly body: string;
    readonly display: string;
    readonly mono: string;
    readonly overline: string;
  };
}

interface UiThemeSemanticTokens {
  readonly border: {
    readonly accent: string;
    readonly danger: string;
    readonly info: string;
    readonly live: string;
    readonly strong: string;
    readonly subtle: string;
    readonly success: string;
    readonly warning: string;
  };
  readonly leaderboard: {
    readonly podium: {
      readonly first: {
        readonly avatarBorder: string;
        readonly avatarShadow: string;
        readonly badgeBackground: string;
        readonly badgeShadow: string;
        readonly badgeText: string;
        readonly columnBackground: string;
        readonly columnBorder: string;
        readonly columnShadow: string;
        readonly crownFilter: string;
        readonly usernameShadow: string;
      };
      readonly second: {
        readonly avatarBorder: string;
        readonly avatarShadow: string;
        readonly badgeBackground: string;
        readonly badgeShadow: string;
        readonly badgeText: string;
        readonly columnBackground: string;
        readonly columnBorder: string;
        readonly columnShadow: string;
      };
      readonly third: {
        readonly avatarBorder: string;
        readonly avatarShadow: string;
        readonly badgeBackground: string;
        readonly badgeShadow: string;
        readonly badgeText: string;
        readonly columnBackground: string;
        readonly columnBorder: string;
        readonly columnShadow: string;
      };
      readonly pointsTextShadowTail: string;
    };
    readonly podiumGlow: {
      readonly first: string;
      readonly second: string;
      readonly third: string;
    };
  };
  readonly shadow: {
    readonly accentGlow: string;
    readonly elevated: string;
    readonly focusRing: string;
    readonly liveGlow: string;
    readonly subtle: string;
    readonly successGlow: string;
  };
  readonly surface: {
    readonly accentMuted: string;
    readonly accentPanel: string;
    readonly canvas: string;
    readonly danger: string;
    readonly field: string;
    readonly live: string;
    readonly neutralMuted: string;
    readonly overlay: string;
    readonly panel: string;
    readonly recessed: string;
    readonly strongAccent: string;
    readonly warning: string;
  };
  readonly text: {
    readonly danger: string;
    readonly emphasis: string;
    readonly link: string;
    readonly live: string;
    readonly onAction: string;
    readonly primary: string;
    readonly quiet: string;
    readonly secondary: string;
    readonly soft: string;
    readonly status: string;
    readonly statusSoft: string;
    readonly warning: string;
  };
}

export function createUiThemeTokens(
  seed: UiThemeSeed,
  colorScheme: UiColorScheme = DEFAULT_UI_COLOR_SCHEME,
) {
  const semanticTokens = seed.semantic[colorScheme];

  return {
    leaderboard: {
      podium: {
        first: {
          avatarBorder: semanticTokens.leaderboard.podium.first.avatarBorder,
          avatarShadow: semanticTokens.leaderboard.podium.first.avatarShadow,
          badgeBackground: semanticTokens.leaderboard.podium.first.badgeBackground,
          badgeShadow: semanticTokens.leaderboard.podium.first.badgeShadow,
          badgeText: semanticTokens.leaderboard.podium.first.badgeText,
          columnBackground: semanticTokens.leaderboard.podium.first.columnBackground,
          columnBorder: semanticTokens.leaderboard.podium.first.columnBorder,
          columnShadow: semanticTokens.leaderboard.podium.first.columnShadow,
          crownFilter: semanticTokens.leaderboard.podium.first.crownFilter,
          usernameShadow: semanticTokens.leaderboard.podium.first.usernameShadow,
        },
        second: {
          avatarBorder: semanticTokens.leaderboard.podium.second.avatarBorder,
          avatarShadow: semanticTokens.leaderboard.podium.second.avatarShadow,
          badgeBackground: semanticTokens.leaderboard.podium.second.badgeBackground,
          badgeShadow: semanticTokens.leaderboard.podium.second.badgeShadow,
          badgeText: semanticTokens.leaderboard.podium.second.badgeText,
          columnBackground: semanticTokens.leaderboard.podium.second.columnBackground,
          columnBorder: semanticTokens.leaderboard.podium.second.columnBorder,
          columnShadow: semanticTokens.leaderboard.podium.second.columnShadow,
        },
        third: {
          avatarBorder: semanticTokens.leaderboard.podium.third.avatarBorder,
          avatarShadow: semanticTokens.leaderboard.podium.third.avatarShadow,
          badgeBackground: semanticTokens.leaderboard.podium.third.badgeBackground,
          badgeShadow: semanticTokens.leaderboard.podium.third.badgeShadow,
          badgeText: semanticTokens.leaderboard.podium.third.badgeText,
          columnBackground: semanticTokens.leaderboard.podium.third.columnBackground,
          columnBorder: semanticTokens.leaderboard.podium.third.columnBorder,
          columnShadow: semanticTokens.leaderboard.podium.third.columnShadow,
        },
        pointsTextShadowTail: semanticTokens.leaderboard.podium.pointsTextShadowTail,
      },
      podiumGlow: {
        first: semanticTokens.leaderboard.podiumGlow.first,
        second: semanticTokens.leaderboard.podiumGlow.second,
        third: semanticTokens.leaderboard.podiumGlow.third,
      },
    },
    color: {
      border: {
        accent: semanticTokens.border.accent,
        danger: semanticTokens.border.danger,
        info: semanticTokens.border.info,
        live: semanticTokens.border.live,
        strong: semanticTokens.border.strong,
        subtle: semanticTokens.border.subtle,
        success: semanticTokens.border.success,
        warning: semanticTokens.border.warning,
      },
      brand: {
        accent: seed.colorScales.highlight[5],
        primary: seed.colorScales.accent[5],
        success: seed.colorScales.success[5],
      },
      surface: {
        accentMuted: semanticTokens.surface.accentMuted,
        accentPanel: semanticTokens.surface.accentPanel,
        canvas: semanticTokens.surface.canvas,
        danger: semanticTokens.surface.danger,
        field: semanticTokens.surface.field,
        live: semanticTokens.surface.live,
        neutralMuted: semanticTokens.surface.neutralMuted,
        overlay: semanticTokens.surface.overlay,
        panel: semanticTokens.surface.panel,
        recessed: semanticTokens.surface.recessed,
        strongAccent: semanticTokens.surface.strongAccent,
        warning: semanticTokens.surface.warning,
      },
      text: {
        danger: semanticTokens.text.danger,
        emphasis: semanticTokens.text.emphasis,
        inverse: semanticTokens.surface.canvas,
        link: semanticTokens.text.link,
        live: semanticTokens.text.live,
        onAction: semanticTokens.text.onAction,
        primary: semanticTokens.text.primary,
        quiet: semanticTokens.text.quiet,
        secondary: semanticTokens.text.secondary,
        soft: semanticTokens.text.soft,
        status: semanticTokens.text.status,
        statusSoft: semanticTokens.text.statusSoft,
        warning: semanticTokens.text.warning,
      },
    },
    motion: seed.motion,
    radius: seed.radius,
    shadow: semanticTokens.shadow,
    spacing: seed.spacing,
    typography: {
      bodyFamily: seed.typography.body,
      displayFamily: seed.typography.display,
      monoFamily: seed.typography.mono,
      overlineFamily: seed.typography.overline,
    },
  } as const;
}

type ResolvedUiThemeTokens = ReturnType<typeof createUiThemeTokens>;

export interface UiThemeDefinition {
  readonly id: UiThemeId;
  readonly mantineTheme: MantineThemeOverride;
  readonly mantineThemes: Record<UiColorScheme, MantineThemeOverride>;
  readonly name: string;
  readonly seed: UiThemeSeed;
  readonly tokens: ResolvedUiThemeTokens;
  readonly tokensByColorScheme: Record<UiColorScheme, ResolvedUiThemeTokens>;
}

function createUiThemeCssVarToken(variableName: string) {
  return `var(${variableName})`;
}

export const uiThemeTokens = {
  leaderboard: {
    podium: {
      first: {
        avatarBorder: createUiThemeCssVarToken('--ui-leaderboard-podium-first-avatar-border'),
        avatarShadow: createUiThemeCssVarToken('--ui-leaderboard-podium-first-avatar-shadow'),
        badgeBackground: createUiThemeCssVarToken('--ui-leaderboard-podium-first-badge-background'),
        badgeShadow: createUiThemeCssVarToken('--ui-leaderboard-podium-first-badge-shadow'),
        badgeText: createUiThemeCssVarToken('--ui-leaderboard-podium-first-badge-text'),
        columnBackground: createUiThemeCssVarToken(
          '--ui-leaderboard-podium-first-column-background',
        ),
        columnBorder: createUiThemeCssVarToken('--ui-leaderboard-podium-first-column-border'),
        columnShadow: createUiThemeCssVarToken('--ui-leaderboard-podium-first-column-shadow'),
        crownFilter: createUiThemeCssVarToken('--ui-leaderboard-podium-first-crown-filter'),
        usernameShadow: createUiThemeCssVarToken('--ui-leaderboard-podium-first-username-shadow'),
      },
      second: {
        avatarBorder: createUiThemeCssVarToken('--ui-leaderboard-podium-second-avatar-border'),
        avatarShadow: createUiThemeCssVarToken('--ui-leaderboard-podium-second-avatar-shadow'),
        badgeBackground: createUiThemeCssVarToken(
          '--ui-leaderboard-podium-second-badge-background',
        ),
        badgeShadow: createUiThemeCssVarToken('--ui-leaderboard-podium-second-badge-shadow'),
        badgeText: createUiThemeCssVarToken('--ui-leaderboard-podium-second-badge-text'),
        columnBackground: createUiThemeCssVarToken(
          '--ui-leaderboard-podium-second-column-background',
        ),
        columnBorder: createUiThemeCssVarToken('--ui-leaderboard-podium-second-column-border'),
        columnShadow: createUiThemeCssVarToken('--ui-leaderboard-podium-second-column-shadow'),
      },
      third: {
        avatarBorder: createUiThemeCssVarToken('--ui-leaderboard-podium-third-avatar-border'),
        avatarShadow: createUiThemeCssVarToken('--ui-leaderboard-podium-third-avatar-shadow'),
        badgeBackground: createUiThemeCssVarToken('--ui-leaderboard-podium-third-badge-background'),
        badgeShadow: createUiThemeCssVarToken('--ui-leaderboard-podium-third-badge-shadow'),
        badgeText: createUiThemeCssVarToken('--ui-leaderboard-podium-third-badge-text'),
        columnBackground: createUiThemeCssVarToken(
          '--ui-leaderboard-podium-third-column-background',
        ),
        columnBorder: createUiThemeCssVarToken('--ui-leaderboard-podium-third-column-border'),
        columnShadow: createUiThemeCssVarToken('--ui-leaderboard-podium-third-column-shadow'),
      },
      pointsTextShadowTail: createUiThemeCssVarToken(
        '--ui-leaderboard-podium-points-text-shadow-tail',
      ),
    },
    podiumGlow: {
      first: createUiThemeCssVarToken('--ui-leaderboard-podium-glow-first'),
      second: createUiThemeCssVarToken('--ui-leaderboard-podium-glow-second'),
      third: createUiThemeCssVarToken('--ui-leaderboard-podium-glow-third'),
    },
  },
  color: {
    border: {
      accent: createUiThemeCssVarToken('--ui-color-border-accent'),
      danger: createUiThemeCssVarToken('--ui-color-border-danger'),
      info: createUiThemeCssVarToken('--ui-color-border-info'),
      live: createUiThemeCssVarToken('--ui-color-border-live'),
      strong: createUiThemeCssVarToken('--ui-color-border-strong'),
      subtle: createUiThemeCssVarToken('--ui-color-border-subtle'),
      success: createUiThemeCssVarToken('--ui-color-border-success'),
      warning: createUiThemeCssVarToken('--ui-color-border-warning'),
    },
    brand: {
      accent: createUiThemeCssVarToken('--ui-color-brand-accent'),
      primary: createUiThemeCssVarToken('--ui-color-brand-primary'),
      success: createUiThemeCssVarToken('--ui-color-brand-success'),
    },
    surface: {
      accentMuted: createUiThemeCssVarToken('--ui-color-surface-accent-muted'),
      accentPanel: createUiThemeCssVarToken('--ui-color-surface-accent-panel'),
      canvas: createUiThemeCssVarToken('--ui-color-surface-canvas'),
      danger: createUiThemeCssVarToken('--ui-color-surface-danger'),
      field: createUiThemeCssVarToken('--ui-color-surface-field'),
      live: createUiThemeCssVarToken('--ui-color-surface-live'),
      neutralMuted: createUiThemeCssVarToken('--ui-color-surface-neutral-muted'),
      overlay: createUiThemeCssVarToken('--ui-color-surface-overlay'),
      panel: createUiThemeCssVarToken('--ui-color-surface-panel'),
      recessed: createUiThemeCssVarToken('--ui-color-surface-recessed'),
      strongAccent: createUiThemeCssVarToken('--ui-color-surface-strong-accent'),
      warning: createUiThemeCssVarToken('--ui-color-surface-warning'),
    },
    text: {
      danger: createUiThemeCssVarToken('--ui-color-text-danger'),
      emphasis: createUiThemeCssVarToken('--ui-color-text-emphasis'),
      inverse: createUiThemeCssVarToken('--ui-color-text-inverse'),
      link: createUiThemeCssVarToken('--ui-color-text-link'),
      live: createUiThemeCssVarToken('--ui-color-text-live'),
      onAction: createUiThemeCssVarToken('--ui-color-text-on-action'),
      primary: createUiThemeCssVarToken('--ui-color-text-primary'),
      quiet: createUiThemeCssVarToken('--ui-color-text-quiet'),
      secondary: createUiThemeCssVarToken('--ui-color-text-secondary'),
      soft: createUiThemeCssVarToken('--ui-color-text-soft'),
      status: createUiThemeCssVarToken('--ui-color-text-status'),
      statusSoft: createUiThemeCssVarToken('--ui-color-text-status-soft'),
      warning: createUiThemeCssVarToken('--ui-color-text-warning'),
    },
  },
  motion: {
    emphasis: createUiThemeCssVarToken('--ui-motion-emphasis'),
    modal: createUiThemeCssVarToken('--ui-motion-modal'),
    quick: createUiThemeCssVarToken('--ui-motion-quick'),
    reveal: createUiThemeCssVarToken('--ui-motion-reveal'),
    standard: createUiThemeCssVarToken('--ui-motion-standard'),
  },
  radius: {
    field: createUiThemeCssVarToken('--ui-radius-field'),
    inset: createUiThemeCssVarToken('--ui-radius-inset'),
    panel: createUiThemeCssVarToken('--ui-radius-panel'),
    pill: createUiThemeCssVarToken('--ui-radius-pill'),
  },
  shadow: {
    accentGlow: createUiThemeCssVarToken('--ui-shadow-accent-glow'),
    elevated: createUiThemeCssVarToken('--ui-shadow-elevated'),
    focusRing: createUiThemeCssVarToken('--ui-shadow-focus-ring'),
    liveGlow: createUiThemeCssVarToken('--ui-shadow-live-glow'),
    subtle: createUiThemeCssVarToken('--ui-shadow-subtle'),
    successGlow: createUiThemeCssVarToken('--ui-shadow-success-glow'),
  },
  spacing: {
    lg: createUiThemeCssVarToken('--ui-spacing-lg'),
    md: createUiThemeCssVarToken('--ui-spacing-md'),
    sm: createUiThemeCssVarToken('--ui-spacing-sm'),
    xl: createUiThemeCssVarToken('--ui-spacing-xl'),
    xs: createUiThemeCssVarToken('--ui-spacing-xs'),
    xxl: createUiThemeCssVarToken('--ui-spacing-xxl'),
    xxs: createUiThemeCssVarToken('--ui-spacing-xxs'),
    xxxl: createUiThemeCssVarToken('--ui-spacing-xxxl'),
  },
  typography: {
    bodyFamily: createUiThemeCssVarToken('--ui-typography-body-family'),
    displayFamily: createUiThemeCssVarToken('--ui-typography-display-family'),
    monoFamily: createUiThemeCssVarToken('--ui-typography-mono-family'),
    overlineFamily: createUiThemeCssVarToken('--ui-typography-overline-family'),
  },
} as const;

export function createUiThemeCssVariables(tokens: ResolvedUiThemeTokens): CSSProperties {
  return {
    '--ui-leaderboard-podium-first-avatar-border': tokens.leaderboard.podium.first.avatarBorder,
    '--ui-leaderboard-podium-first-avatar-shadow': tokens.leaderboard.podium.first.avatarShadow,
    '--ui-leaderboard-podium-first-badge-background':
      tokens.leaderboard.podium.first.badgeBackground,
    '--ui-leaderboard-podium-first-badge-shadow': tokens.leaderboard.podium.first.badgeShadow,
    '--ui-leaderboard-podium-first-badge-text': tokens.leaderboard.podium.first.badgeText,
    '--ui-leaderboard-podium-first-column-background':
      tokens.leaderboard.podium.first.columnBackground,
    '--ui-leaderboard-podium-first-column-border': tokens.leaderboard.podium.first.columnBorder,
    '--ui-leaderboard-podium-first-column-shadow': tokens.leaderboard.podium.first.columnShadow,
    '--ui-leaderboard-podium-first-crown-filter': tokens.leaderboard.podium.first.crownFilter,
    '--ui-leaderboard-podium-first-username-shadow': tokens.leaderboard.podium.first.usernameShadow,
    '--ui-leaderboard-podium-second-avatar-border': tokens.leaderboard.podium.second.avatarBorder,
    '--ui-leaderboard-podium-second-avatar-shadow': tokens.leaderboard.podium.second.avatarShadow,
    '--ui-leaderboard-podium-second-badge-background':
      tokens.leaderboard.podium.second.badgeBackground,
    '--ui-leaderboard-podium-second-badge-shadow': tokens.leaderboard.podium.second.badgeShadow,
    '--ui-leaderboard-podium-second-badge-text': tokens.leaderboard.podium.second.badgeText,
    '--ui-leaderboard-podium-second-column-background':
      tokens.leaderboard.podium.second.columnBackground,
    '--ui-leaderboard-podium-second-column-border': tokens.leaderboard.podium.second.columnBorder,
    '--ui-leaderboard-podium-second-column-shadow': tokens.leaderboard.podium.second.columnShadow,
    '--ui-leaderboard-podium-third-avatar-border': tokens.leaderboard.podium.third.avatarBorder,
    '--ui-leaderboard-podium-third-avatar-shadow': tokens.leaderboard.podium.third.avatarShadow,
    '--ui-leaderboard-podium-third-badge-background':
      tokens.leaderboard.podium.third.badgeBackground,
    '--ui-leaderboard-podium-third-badge-shadow': tokens.leaderboard.podium.third.badgeShadow,
    '--ui-leaderboard-podium-third-badge-text': tokens.leaderboard.podium.third.badgeText,
    '--ui-leaderboard-podium-third-column-background':
      tokens.leaderboard.podium.third.columnBackground,
    '--ui-leaderboard-podium-third-column-border': tokens.leaderboard.podium.third.columnBorder,
    '--ui-leaderboard-podium-third-column-shadow': tokens.leaderboard.podium.third.columnShadow,
    '--ui-leaderboard-podium-points-text-shadow-tail':
      tokens.leaderboard.podium.pointsTextShadowTail,
    '--ui-leaderboard-podium-glow-first': tokens.leaderboard.podiumGlow.first,
    '--ui-leaderboard-podium-glow-second': tokens.leaderboard.podiumGlow.second,
    '--ui-leaderboard-podium-glow-third': tokens.leaderboard.podiumGlow.third,
    '--ui-color-border-accent': tokens.color.border.accent,
    '--ui-color-border-danger': tokens.color.border.danger,
    '--ui-color-border-info': tokens.color.border.info,
    '--ui-color-border-live': tokens.color.border.live,
    '--ui-color-border-strong': tokens.color.border.strong,
    '--ui-color-border-subtle': tokens.color.border.subtle,
    '--ui-color-border-success': tokens.color.border.success,
    '--ui-color-border-warning': tokens.color.border.warning,
    '--ui-color-brand-accent': tokens.color.brand.accent,
    '--ui-color-brand-primary': tokens.color.brand.primary,
    '--ui-color-brand-success': tokens.color.brand.success,
    '--ui-color-surface-accent-muted': tokens.color.surface.accentMuted,
    '--ui-color-surface-accent-panel': tokens.color.surface.accentPanel,
    '--ui-color-surface-canvas': tokens.color.surface.canvas,
    '--ui-color-surface-danger': tokens.color.surface.danger,
    '--ui-color-surface-field': tokens.color.surface.field,
    '--ui-color-surface-live': tokens.color.surface.live,
    '--ui-color-surface-neutral-muted': tokens.color.surface.neutralMuted,
    '--ui-color-surface-overlay': tokens.color.surface.overlay,
    '--ui-color-surface-panel': tokens.color.surface.panel,
    '--ui-color-surface-recessed': tokens.color.surface.recessed,
    '--ui-color-surface-strong-accent': tokens.color.surface.strongAccent,
    '--ui-color-surface-warning': tokens.color.surface.warning,
    '--ui-color-text-danger': tokens.color.text.danger,
    '--ui-color-text-emphasis': tokens.color.text.emphasis,
    '--ui-color-text-inverse': tokens.color.text.inverse,
    '--ui-color-text-link': tokens.color.text.link,
    '--ui-color-text-live': tokens.color.text.live,
    '--ui-color-text-on-action': tokens.color.text.onAction,
    '--ui-color-text-primary': tokens.color.text.primary,
    '--ui-color-text-quiet': tokens.color.text.quiet,
    '--ui-color-text-secondary': tokens.color.text.secondary,
    '--ui-color-text-soft': tokens.color.text.soft,
    '--ui-color-text-status': tokens.color.text.status,
    '--ui-color-text-status-soft': tokens.color.text.statusSoft,
    '--ui-color-text-warning': tokens.color.text.warning,
    '--ui-motion-emphasis': tokens.motion.emphasis,
    '--ui-motion-modal': tokens.motion.modal,
    '--ui-motion-quick': tokens.motion.quick,
    '--ui-motion-reveal': tokens.motion.reveal,
    '--ui-motion-standard': tokens.motion.standard,
    '--ui-radius-field': tokens.radius.field,
    '--ui-radius-inset': tokens.radius.inset,
    '--ui-radius-panel': tokens.radius.panel,
    '--ui-radius-pill': tokens.radius.pill,
    '--ui-shadow-accent-glow': tokens.shadow.accentGlow,
    '--ui-shadow-elevated': tokens.shadow.elevated,
    '--ui-shadow-focus-ring': tokens.shadow.focusRing,
    '--ui-shadow-live-glow': tokens.shadow.liveGlow,
    '--ui-shadow-subtle': tokens.shadow.subtle,
    '--ui-shadow-success-glow': tokens.shadow.successGlow,
    '--ui-spacing-lg': tokens.spacing.lg,
    '--ui-spacing-md': tokens.spacing.md,
    '--ui-spacing-sm': tokens.spacing.sm,
    '--ui-spacing-xl': tokens.spacing.xl,
    '--ui-spacing-xs': tokens.spacing.xs,
    '--ui-spacing-xxl': tokens.spacing.xxl,
    '--ui-spacing-xxs': tokens.spacing.xxs,
    '--ui-spacing-xxxl': tokens.spacing.xxxl,
    '--ui-typography-body-family': tokens.typography.bodyFamily,
    '--ui-typography-display-family': tokens.typography.displayFamily,
    '--ui-typography-mono-family': tokens.typography.monoFamily,
    '--ui-typography-overline-family': tokens.typography.overlineFamily,
  } as CSSProperties;
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

export function createFieldInputStyle(isInvalid: boolean): CSSProperties {
  return {
    background: uiThemeTokens.color.surface.field,
    border: `1px solid ${
      isInvalid ? uiThemeTokens.color.border.danger : uiThemeTokens.color.border.subtle
    }`,
    borderRadius: uiThemeTokens.radius.field,
    color: uiThemeTokens.color.text.primary,
    outline: 'none',
    padding: '0.9rem 1rem',
    width: '100%',
  };
}

const overlineTextStyle = {
  color: uiThemeTokens.color.brand.primary,
  fontFamily: uiThemeTokens.typography.overlineFamily,
  fontSize: '0.55rem',
  letterSpacing: '0.35rem',
  textTransform: 'uppercase',
} satisfies CSSProperties;

export const statusBannerToneStyles = {
  error: {
    background: uiThemeTokens.color.surface.danger,
    borderColor: uiThemeTokens.color.border.danger,
    color: uiThemeTokens.color.text.danger,
  },
  info: {
    background: uiThemeTokens.color.surface.accentMuted,
    borderColor: uiThemeTokens.color.border.accent,
    color: uiThemeTokens.color.text.status,
  },
  success: {
    background: uiThemeTokens.color.surface.recessed,
    borderColor: uiThemeTokens.color.border.success,
    color: uiThemeTokens.color.text.statusSoft,
  },
} as const;

export function createTextareaInputStyle(isInvalid: boolean): CSSProperties {
  return {
    ...createFieldInputStyle(isInvalid),
    minHeight: '7.5rem',
    resize: 'vertical',
  };
}

export function createEyebrowTextStyle({
  compact = false,
  tone = 'accent',
}: {
  readonly compact?: boolean;
  readonly tone?: 'accent' | 'success';
} = {}): CSSProperties {
  return {
    ...overlineTextStyle,
    color:
      tone === 'success' ? uiThemeTokens.color.brand.success : uiThemeTokens.color.brand.primary,
    letterSpacing: compact ? '0.32rem' : overlineTextStyle.letterSpacing,
  };
}

export function createHeadingStyle({
  fontSize,
  lineHeight,
}: {
  readonly fontSize: string;
  readonly lineHeight: number;
}): CSSProperties {
  return {
    color: uiThemeTokens.color.text.emphasis,
    fontSize,
    lineHeight,
  };
}

const basePillLinkStyle = {
  alignItems: 'center',
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.text.secondary,
  display: 'inline-flex',
  fontWeight: 700,
  justifyContent: 'center',
  lineHeight: 1,
  padding: '0.9rem 1.2rem',
  textDecoration: 'none',
} satisfies CSSProperties;

export const navPillLinkStyle = {
  ...basePillLinkStyle,
  fontSize: '0.72rem',
  letterSpacing: '0.22rem',
  textTransform: 'uppercase',
} satisfies CSSProperties;

export const actionLinkStyles = {
  accent: {
    ...basePillLinkStyle,
    background: uiThemeTokens.color.surface.strongAccent,
    borderColor: uiThemeTokens.color.border.strong,
    color: uiThemeTokens.color.text.primary,
    fontSize: '0.8rem',
  },
  primary: {
    ...basePillLinkStyle,
    background: uiThemeTokens.color.surface.accentPanel,
    borderColor: uiThemeTokens.color.border.accent,
    color: uiThemeTokens.color.text.primary,
    fontSize: '0.8rem',
  },
  secondary: {
    ...basePillLinkStyle,
    background: uiThemeTokens.color.surface.neutralMuted,
    color: uiThemeTokens.color.text.primary,
    fontSize: '0.8rem',
  },
} as const satisfies Record<'accent' | 'primary' | 'secondary', CSSProperties>;

export const inlineLinkStyle = {
  color: uiThemeTokens.color.brand.primary,
  fontSize: '0.95rem',
  fontWeight: 700,
  textDecoration: 'none',
} satisfies CSSProperties;

export const emphasizedSummaryTextStyle = {
  color: uiThemeTokens.color.text.emphasis,
  fontSize: '0.875rem',
  fontWeight: 600,
  margin: 0,
} satisfies CSSProperties;

export const lobbyPlayerCardStyle = {
  background: uiThemeTokens.color.surface.recessed,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
} satisfies CSSProperties;

export function createBadgeStyle(tone: 'accent' | 'success' | 'neutral' | 'info'): CSSProperties {
  const toneMap = {
    accent: {
      background: uiThemeTokens.color.surface.accentPanel,
      borderColor: uiThemeTokens.color.border.accent,
      color: uiThemeTokens.color.text.status,
    },
    success: {
      background: uiThemeTokens.color.surface.recessed,
      borderColor: uiThemeTokens.color.border.success,
      color: uiThemeTokens.color.text.statusSoft,
    },
    neutral: {
      background: uiThemeTokens.color.surface.neutralMuted,
      borderColor: uiThemeTokens.color.border.subtle,
      color: uiThemeTokens.color.text.secondary,
    },
    info: {
      background: uiThemeTokens.color.surface.accentMuted,
      borderColor: uiThemeTokens.color.border.accent,
      color: uiThemeTokens.color.text.status,
    },
  } as const;

  return {
    ...toneMap[tone],
    border: `1px solid ${toneMap[tone].borderColor}`,
    borderRadius: uiThemeTokens.radius.pill,
    display: 'inline-flex',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    lineHeight: 1,
    padding: '0.35rem 0.75rem',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  };
}

export const authLayoutRootStyle = {
  alignItems: 'center',
  background: [
    `radial-gradient(circle at top, ${uiThemeTokens.color.surface.accentMuted}, transparent 42%)`,
    `linear-gradient(180deg, ${uiThemeTokens.color.surface.canvas}, ${uiThemeTokens.color.surface.recessed})`,
  ].join(', '),
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  minHeight: 0,
  overflow: 'hidden',
  padding: `${uiThemeTokens.spacing.xl} ${uiThemeTokens.spacing.md}`,
  position: 'relative',
} satisfies CSSProperties;

export const AUTH_LAYOUT_RESPONSIVE_CSS = `
  [data-patience-playground]:has([data-auth-layout]) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  [data-auth-shell] { width: min(100%, 30rem); }
  @media (min-width: 48em) {
    [data-auth-shell] { width: min(100%, 34rem); }
  }
`;

export const authLayoutBackdropStyle = {
  background: [
    `radial-gradient(circle at 18% 22%, ${uiThemeTokens.color.surface.strongAccent}, transparent 30%)`,
    `radial-gradient(circle at 78% 10%, ${uiThemeTokens.color.surface.accentPanel}, transparent 24%)`,
    `radial-gradient(circle at 50% 100%, ${uiThemeTokens.color.surface.accentMuted}, transparent 36%)`,
  ].join(', '),
  inset: 0,
  opacity: 0.72,
  position: 'absolute',
} satisfies CSSProperties;

export const authLayoutShellStyle = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: 0,
  position: 'relative',
  width: '100%',
  zIndex: 1,
} satisfies CSSProperties;

export const authLayoutBrandingPanelStyle = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
} satisfies CSSProperties;

export const authLayoutTaglineStyle = {
  color: uiThemeTokens.color.text.secondary,
  fontFamily: uiThemeTokens.typography.bodyFamily,
  fontSize: '0.9375rem',
  lineHeight: 1.5,
  margin: 0,
  textAlign: 'center',
} satisfies CSSProperties;

export const authBrandingFeatureListStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.md}`,
  justifyContent: 'center',
  listStyle: 'none',
  margin: 0,
  padding: 0,
} satisfies CSSProperties;

export const authBrandingFeatureItemStyle = {
  alignItems: 'center',
  color: uiThemeTokens.color.text.soft,
  display: 'flex',
  fontFamily: uiThemeTokens.typography.bodyFamily,
  fontSize: '0.8125rem',
  gap: uiThemeTokens.spacing.xs,
} satisfies CSSProperties;

export const authLayoutContentPanelStyle = {
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
} satisfies CSSProperties;

export const authFormCardStyle = {
  background: uiThemeTokens.color.surface.panel,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.panel,
  boxShadow: uiThemeTokens.shadow.elevated,
  maxWidth: '34rem',
  padding: uiThemeTokens.spacing.xl,
  width: '100%',
} satisfies CSSProperties;

export const authAvatarFrameStyle = {
  border: `2px solid ${uiThemeTokens.color.border.accent}`,
  borderRadius: '50%',
  boxShadow: uiThemeTokens.shadow.accentGlow,
  height: '5rem',
  objectFit: 'cover',
  width: '5rem',
} satisfies CSSProperties;

export const authProfileIdentityStyle = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
} satisfies CSSProperties;

export const authAccountActionsStyle = {
  background: uiThemeTokens.color.surface.recessed,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.inset,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
  padding: uiThemeTokens.spacing.md,
} satisfies CSSProperties;
