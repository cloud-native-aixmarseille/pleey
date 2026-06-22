import { Group, Paper, Text } from '@mantine/core';
import type { PropsWithChildren, ReactNode } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';

interface InlineStatPillProps extends PropsWithChildren {
  readonly icon?: ReactNode;
}

export function InlineStatPill({ children, icon }: InlineStatPillProps) {
  if (!children) {
    return null;
  }

  return (
    <Paper
      bg={uiThemeTokens.color.surface.neutralMuted}
      bd={`1px solid ${uiThemeTokens.color.border.subtle}`}
      component="span"
      px="sm"
      py={4}
      radius={uiThemeTokens.radius.pill}
    >
      <Group component="span" gap={6} wrap="nowrap">
        {icon ?? null}
        <Text c={uiThemeTokens.color.text.secondary} component="span" lh={1.2} size="sm">
          {children}
        </Text>
      </Group>
    </Paper>
  );
}
