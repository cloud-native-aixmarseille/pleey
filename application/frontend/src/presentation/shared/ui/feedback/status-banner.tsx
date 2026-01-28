import { Alert } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { statusToneRecipes } from '../foundation/ui-recipes';
import { uiThemeTokens } from '../foundation/ui-theme';
import { AppIcon, type AppIconName } from '../icons/app-icon';

type StatusBannerTone = 'error' | 'success' | 'info' | 'warning' | 'live';

interface StatusBannerProps extends PropsWithChildren {
  readonly tone?: StatusBannerTone;
}

const toneToRecipe: Record<
  StatusBannerTone,
  { background: string; borderColor: string; color: string; iconName: AppIconName }
> = {
  error: { ...statusToneRecipes.error, iconName: 'error' },
  success: { ...statusToneRecipes.success, iconName: 'success' },
  info: { ...statusToneRecipes.info, iconName: 'info' },
  warning: { ...statusToneRecipes.warning, iconName: 'error' },
  live: { ...statusToneRecipes.live, iconName: 'game' },
};

export function StatusBanner({ children, tone = 'info' }: StatusBannerProps) {
  if (!children) {
    return null;
  }

  const isError = tone === 'error';
  const role = isError ? 'alert' : 'status';
  const liveRegion = isError ? 'assertive' : 'polite';
  const recipe = toneToRecipe[tone];

  return (
    <Alert
      aria-live={liveRegion}
      icon={<AppIcon name={recipe.iconName} size={18} />}
      role={role}
      styles={{
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
      }}
      variant="light"
    >
      {children}
    </Alert>
  );
}
