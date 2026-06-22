import { Box } from '@mantine/core';
import type { ComponentPropsWithoutRef } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';

interface ReorderDropIndicatorProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  readonly compact?: boolean;
}

export function ReorderDropIndicator({ compact = false, ...props }: ReorderDropIndicatorProps) {
  return (
    <Box
      aria-hidden="true"
      bg={uiThemeTokens.color.brand.primary}
      h="0.25rem"
      my={compact ? '0.15rem' : '0.2rem'}
      style={{
        borderRadius: '999px',
        boxShadow: `0 0 0 4px color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 18%, transparent)`,
      }}
      {...props}
    />
  );
}
