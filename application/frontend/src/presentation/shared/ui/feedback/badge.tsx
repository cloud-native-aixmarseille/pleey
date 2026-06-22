import { Group, Badge as MantineBadge } from '@mantine/core';
import type { PropsWithChildren, ReactNode } from 'react';
import { createBadgeStyle } from '../foundation/ui-theme';

interface BadgeProps extends PropsWithChildren {
  readonly icon?: ReactNode;
  readonly tone?: 'accent' | 'success' | 'neutral' | 'info' | 'warning' | 'error' | 'live';
}

export function Badge({ children, icon, tone = 'accent' }: BadgeProps) {
  if (!children) {
    return null;
  }

  return (
    <MantineBadge styles={{ root: createBadgeStyle(tone) }} variant="light">
      {icon ? (
        <Group gap={4} wrap="nowrap">
          {icon}
          <span>{children}</span>
        </Group>
      ) : (
        children
      )}
    </MantineBadge>
  );
}
