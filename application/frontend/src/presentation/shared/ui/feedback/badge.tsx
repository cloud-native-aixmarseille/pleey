import { Badge as MantineBadge } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { createBadgeStyle } from '../foundation/ui-theme';

interface BadgeProps extends PropsWithChildren {
  readonly tone?: 'accent' | 'success' | 'neutral' | 'info';
}

export function Badge({ children, tone = 'accent' }: BadgeProps) {
  if (!children) {
    return null;
  }

  return (
    <MantineBadge style={createBadgeStyle(tone)} variant="light">
      {children}
    </MantineBadge>
  );
}
