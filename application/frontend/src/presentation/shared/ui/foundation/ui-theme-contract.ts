import { CYBER_ARCADE_THEME_ID } from './cyber-arcade-theme';
import { SOLAR_GRID_THEME_ID } from './solar-grid-theme';

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
