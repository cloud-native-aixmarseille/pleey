import { uiThemeTokens } from './ui-theme-tokens';

export const uiBooleanChoiceColors = {
  true: {
    badgeBackground: uiThemeTokens.color.surface.recessed,
    badgeText: uiThemeTokens.color.text.statusSoft,
    surfaceBackground: `color-mix(in srgb, ${uiThemeTokens.color.brand.success} 22%, ${uiThemeTokens.color.surface.panel})`,
    surfaceBorder: uiThemeTokens.color.border.success,
  },
  false: {
    badgeBackground: uiThemeTokens.color.surface.danger,
    badgeText: uiThemeTokens.color.text.danger,
    surfaceBackground: uiThemeTokens.color.surface.danger,
    surfaceBorder: uiThemeTokens.color.border.danger,
  },
} as const;
