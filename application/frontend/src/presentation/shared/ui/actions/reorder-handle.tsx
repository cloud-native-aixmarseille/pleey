import { Paper } from '@mantine/core';
import type { ComponentPropsWithoutRef } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';
import { AppIcon } from '../icons/app-icon';

interface ReorderHandleProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  readonly active?: boolean;
  readonly dragging?: boolean;
}

export function ReorderHandle({ active = false, dragging = false, ...props }: ReorderHandleProps) {
  return (
    <Paper
      aria-hidden="true"
      bg={
        active
          ? `color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 10%, transparent)`
          : 'transparent'
      }
      bd={
        active
          ? `1px solid color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 55%, transparent)`
          : '1px solid transparent'
      }
      component="span"
      p="xs"
      radius="md"
      style={{
        cursor: dragging ? 'grabbing' : 'grab',
        display: 'inline-flex',
        touchAction: 'none',
        transition: 'background 120ms ease, border-color 120ms ease',
      }}
      {...props}
    >
      <AppIcon name="grip-vertical" size={16} />
    </Paper>
  );
}
