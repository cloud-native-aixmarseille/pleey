import { Center, Paper } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';

interface AccentIconBadgeProps extends PropsWithChildren {
  readonly size?: number;
}

export function AccentIconBadge({ children, size = 56 }: AccentIconBadgeProps) {
  return (
    <Paper
      bg={uiThemeTokens.color.surface.accentMuted}
      bd={`2px solid ${uiThemeTokens.color.border.accent}`}
      component="span"
      p={0}
      radius="50%"
      shadow="md"
      style={{ display: 'inline-block' }}
    >
      <Center h={size} w={size}>
        {children}
      </Center>
    </Paper>
  );
}
