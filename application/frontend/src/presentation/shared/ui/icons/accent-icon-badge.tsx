import { Box } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';

interface AccentIconBadgeProps extends PropsWithChildren {
  readonly size?: number;
}

function createAccentIconBadgeStyle(size: number) {
  return {
    alignItems: 'center',
    background: uiThemeTokens.color.surface.accentMuted,
    border: `2px solid ${uiThemeTokens.color.border.accent}`,
    borderRadius: '50%',
    boxShadow: uiThemeTokens.shadow.accentGlow,
    display: 'flex',
    height: size,
    justifyContent: 'center',
    width: size,
  } as const;
}

export function AccentIconBadge({ children, size = 56 }: AccentIconBadgeProps) {
  return <Box style={createAccentIconBadgeStyle(size)}>{children}</Box>;
}
