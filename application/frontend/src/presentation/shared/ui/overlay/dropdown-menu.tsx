import { Menu } from '@mantine/core';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { surfaceRecipes } from '../foundation/ui-recipes';
import { uiThemeTokens } from '../foundation/ui-theme';

interface DropdownMenuProps {
  readonly ariaLabel?: string;
  readonly children: ReactNode;
  readonly closeOnItemClick?: boolean;
  readonly dropdownStyle?: NonNullable<ComponentPropsWithoutRef<'div'>['style']>;
  readonly keepMounted?: boolean;
  readonly onChange?: (opened: boolean) => void;
  readonly opened?: boolean;
  readonly position?: 'bottom' | 'bottom-end' | 'bottom-start' | 'top' | 'top-end' | 'top-start';
  readonly shadow?: 'sm' | 'md' | 'lg';
  readonly trigger: ReactNode;
  readonly width?: number;
  readonly withinPortal?: boolean;
}

interface DropdownMenuLabelProps {
  readonly children: ReactNode;
}

interface DropdownMenuItemProps {
  readonly ariaKeyShortcuts?: string;
  readonly children: ReactNode;
  readonly color?: string;
  readonly disabled?: boolean;
  readonly leftSection?: ReactNode;
  readonly onClick?: () => void;
}

const defaultDropdownStyle = {
  ...surfaceRecipes.elevated,
  background: `color-mix(in srgb, ${uiThemeTokens.color.surface.overlay} 76%, ${uiThemeTokens.color.surface.panel})`,
  backdropFilter: 'blur(12px)',
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  boxShadow: uiThemeTokens.shadow.elevated,
} as const;

export function DropdownMenu({
  ariaLabel,
  children,
  closeOnItemClick = true,
  dropdownStyle,
  keepMounted = false,
  onChange,
  opened,
  position = 'bottom-end',
  shadow = 'md',
  trigger,
  width = 240,
  withinPortal = true,
}: DropdownMenuProps) {
  return (
    <Menu
      closeOnItemClick={closeOnItemClick}
      keepMounted={keepMounted}
      onChange={onChange}
      opened={opened}
      position={position}
      shadow={shadow}
      width={width}
      withinPortal={withinPortal}
    >
      <Menu.Target>{trigger}</Menu.Target>
      <Menu.Dropdown
        aria-label={ariaLabel}
        style={dropdownStyle ? { ...defaultDropdownStyle, ...dropdownStyle } : defaultDropdownStyle}
      >
        {children}
      </Menu.Dropdown>
    </Menu>
  );
}

export function DropdownMenuLabel({ children }: DropdownMenuLabelProps) {
  return <Menu.Label>{children}</Menu.Label>;
}

export function DropdownMenuDivider() {
  return <Menu.Divider />;
}

export function DropdownMenuItem({
  ariaKeyShortcuts,
  children,
  color,
  disabled = false,
  leftSection,
  onClick,
}: DropdownMenuItemProps) {
  return (
    <Menu.Item
      aria-keyshortcuts={ariaKeyShortcuts}
      color={color}
      disabled={disabled}
      leftSection={leftSection}
      onClick={onClick}
    >
      {children}
    </Menu.Item>
  );
}
