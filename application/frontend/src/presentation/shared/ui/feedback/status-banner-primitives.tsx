import { statusToneRecipes } from '../foundation/ui-recipes';
import { uiThemeTokens } from '../foundation/ui-theme';
import type { AppIconName } from '../icons/app-icon';
import { AppIcon } from '../icons/app-icon';

export type StatusBannerTone = 'error' | 'success' | 'info' | 'warning' | 'live';

interface StatusToneRecipe {
  readonly background: string;
  readonly borderColor: string;
  readonly color: string;
  readonly iconName: AppIconName;
}

const statusBannerToneRecipes: Record<StatusBannerTone, StatusToneRecipe> = {
  error: { ...statusToneRecipes.error, iconName: 'error' },
  success: { ...statusToneRecipes.success, iconName: 'success' },
  info: { ...statusToneRecipes.info, iconName: 'info' },
  warning: { ...statusToneRecipes.warning, iconName: 'error' },
  live: { ...statusToneRecipes.live, iconName: 'game' },
};

export function createStatusBannerStyles(tone: StatusBannerTone) {
  const recipe = statusBannerToneRecipes[tone];

  return {
    body: {
      margin: 0,
    },
    icon: {
      alignSelf: 'flex-start',
      background: `linear-gradient(135deg, color-mix(in srgb, ${recipe.borderColor} 28%, ${uiThemeTokens.color.surface.canvas}) 0%, ${uiThemeTokens.color.surface.canvas} 100%)`,
      border: `1px solid color-mix(in srgb, ${recipe.borderColor} 40%, ${uiThemeTokens.color.border.subtle})`,
      borderRadius: uiThemeTokens.radius.pill,
      color: recipe.color,
      boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.24), 0 10px 20px rgba(0, 0, 0, 0.08)`,
      padding: '0.45rem',
    },
    message: {
      color: recipe.color,
      fontSize: '0.96rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.45,
    },
    root: {
      background: `linear-gradient(135deg, color-mix(in srgb, ${recipe.background} 72%, ${uiThemeTokens.color.surface.canvas}) 0%, ${uiThemeTokens.color.surface.canvas} 74%)`,
      border: `1px solid color-mix(in srgb, ${recipe.borderColor} 36%, ${uiThemeTokens.color.border.subtle})`,
      borderLeft: `4px solid ${recipe.borderColor}`,
      borderRadius: `calc(${uiThemeTokens.radius.field} + 4px)`,
      boxShadow: `0 16px 34px rgba(0, 0, 0, 0.10), ${uiThemeTokens.shadow.subtle}`,
      color: recipe.color,
      fontSize: '0.95rem',
      overflow: 'hidden',
      padding: `${uiThemeTokens.spacing.md} ${uiThemeTokens.spacing.lg}`,
    },
  } as const;
}

export function StatusBannerIcon({ tone }: { readonly tone: StatusBannerTone }) {
  return <AppIcon name={statusBannerToneRecipes[tone].iconName} size={18} />;
}
