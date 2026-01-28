import { Group, Stack } from '@mantine/core';
import type { ReactNode } from 'react';
import { surfaceRecipes } from '../foundation/ui-recipes';
import { uiThemeTokens } from '../foundation/ui-theme';
import { uiTypeScale } from '../foundation/ui-typography';

interface SubpageHeaderProps {
  readonly kicker: string;
  readonly title: string;
  readonly subtitle: string;
  readonly actions?: ReactNode;
}

const rootStyle = {
  ...surfaceRecipes.elevated,
  padding: uiThemeTokens.spacing.xl,
} as const;

const kickerStyle = {
  ...uiTypeScale.overline,
  color: uiThemeTokens.color.brand.primary,
  margin: 0,
  textTransform: 'uppercase',
} as const;

const titleStyle = {
  ...uiTypeScale.pageTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
} as const;

const subtitleStyle = {
  ...uiTypeScale.body,
  color: uiThemeTokens.color.text.secondary,
  margin: 0,
  maxWidth: '48rem',
} as const;

export function SubpageHeader({ kicker, title, subtitle, actions }: SubpageHeaderProps) {
  return (
    <header style={rootStyle}>
      <Group align="flex-start" gap="xl" justify="space-between">
        <Stack gap="xs" style={{ maxWidth: '48rem' }}>
          <p style={kickerStyle}>{kicker}</p>
          <h2 style={titleStyle}>{title}</h2>
          <p style={subtitleStyle}>{subtitle}</p>
        </Stack>
        {actions ? (
          <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
            {actions}
          </Group>
        ) : null}
      </Group>
    </header>
  );
}
