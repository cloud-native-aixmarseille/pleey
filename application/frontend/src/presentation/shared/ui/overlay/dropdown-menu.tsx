import { Menu } from '@mantine/core';
import type { ReactNode } from 'react';

interface DropdownMenuProps {
  readonly children: ReactNode;
  readonly position?: 'bottom' | 'bottom-end' | 'bottom-start' | 'top' | 'top-end' | 'top-start';
  readonly shadow?: 'sm' | 'md' | 'lg';
  readonly trigger: ReactNode;
  readonly width?: number;
  readonly withinPortal?: boolean;
}

interface DropdownMenuLabelProps {
  readonly children: ReactNode;
}

export function DropdownMenu({
  children,
  position = 'bottom-end',
  shadow = 'md',
  trigger,
  width = 240,
  withinPortal = true,
}: DropdownMenuProps) {
  return (
    <Menu position={position} shadow={shadow} width={width} withinPortal={withinPortal}>
      <Menu.Target>{trigger}</Menu.Target>
      <Menu.Dropdown>{children}</Menu.Dropdown>
    </Menu>
  );
}

export function DropdownMenuLabel({ children }: DropdownMenuLabelProps) {
  return <Menu.Label>{children}</Menu.Label>;
}

export function DropdownMenuDivider() {
  return <Menu.Divider />;
}
