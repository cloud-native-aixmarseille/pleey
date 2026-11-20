import { Tooltip as MantineTooltip } from '@mantine/core';
import type { ReactNode } from 'react';

interface TooltipProps {
  readonly children: ReactNode;
  readonly disabled?: boolean;
  readonly label: string;
  readonly withArrow?: boolean;
}

export function Tooltip({ children, disabled = false, label, withArrow = false }: TooltipProps) {
  return (
    <MantineTooltip
      disabled={disabled}
      events={{ focus: true, hover: true, touch: true }}
      label={label}
      withArrow={withArrow}
    >
      {children}
    </MantineTooltip>
  );
}
