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
    body: { margin: 0 },
    icon: {
      alignSelf: 'flex-start',
      border: `1px solid ${recipe.borderColor}`,
      borderRadius: uiThemeTokens.radius.pill,
      color: recipe.color,
      padding: '0.35rem',
    },
    message: { color: recipe.color },
    root: {
      background: recipe.background,
      border: `1px solid ${recipe.borderColor}`,
      borderRadius: uiThemeTokens.radius.field,
      boxShadow: uiThemeTokens.shadow.subtle,
      color: recipe.color,
      fontSize: '0.95rem',
      padding: `${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.md}`,
    },
  } as const;
}

export function StatusBannerIcon({ tone }: { readonly tone: StatusBannerTone }) {
  return <AppIcon name={statusBannerToneRecipes[tone].iconName} size={18} />;
}
