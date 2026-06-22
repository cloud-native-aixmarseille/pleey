import { Group, Paper, Text } from '@mantine/core';
import type { PropsWithChildren } from 'react';
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

function getStatusBannerToneRecipe(tone: StatusBannerTone) {
  return statusBannerToneRecipes[tone];
}

interface StatusBannerFrameProps extends PropsWithChildren {
  readonly ariaLive: 'assertive' | 'polite';
  readonly role: 'alert' | 'status';
  readonly tone: StatusBannerTone;
}

export function StatusBannerFrame({ ariaLive, children, role, tone }: StatusBannerFrameProps) {
  const recipe = getStatusBannerToneRecipe(tone);

  return (
    <Paper
      aria-live={ariaLive}
      bg={`linear-gradient(135deg, color-mix(in srgb, ${recipe.background} 72%, ${uiThemeTokens.color.surface.canvas}) 0%, ${uiThemeTokens.color.surface.canvas} 74%)`}
      bd={`1px solid color-mix(in srgb, ${recipe.borderColor} 36%, ${uiThemeTokens.color.border.subtle})`}
      c={recipe.color}
      px="lg"
      py="md"
      radius={`calc(${uiThemeTokens.radius.field} + 4px)`}
      role={role}
      shadow="xl"
      style={{
        borderLeft: `4px solid ${recipe.borderColor}`,
        overflow: 'hidden',
      }}
    >
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <Paper
          bg={`linear-gradient(135deg, color-mix(in srgb, ${recipe.borderColor} 28%, ${uiThemeTokens.color.surface.canvas}) 0%, ${uiThemeTokens.color.surface.canvas} 100%)`}
          bd={`1px solid color-mix(in srgb, ${recipe.borderColor} 40%, ${uiThemeTokens.color.border.subtle})`}
          c={recipe.color}
          p="0.45rem"
          radius={uiThemeTokens.radius.pill}
          shadow="sm"
          style={{ alignSelf: 'flex-start' }}
        >
          <StatusBannerIcon tone={tone} />
        </Paper>
        <Text c={recipe.color} fz="0.96rem" fw={600} lh={1.45} lts="-0.01em" m={0}>
          {children}
        </Text>
      </Group>
    </Paper>
  );
}

function StatusBannerIcon({ tone }: { readonly tone: StatusBannerTone }) {
  return <AppIcon name={getStatusBannerToneRecipe(tone).iconName} size={18} />;
}
