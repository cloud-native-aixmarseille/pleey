import { Box, Divider, Text } from '@mantine/core';
import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode, RefObject } from 'react';
import { surfaceRecipes } from '../../foundation/ui-recipes';
import { uiThemeTokens } from '../../foundation/ui-theme';
import { ActionRow } from '../../layout/containers';

interface AccountMenuWrapperProps extends PropsWithChildren {
  readonly wrapperRef?: RefObject<HTMLDivElement | null>;
}

interface AccountMenuTriggerButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  readonly children: ReactNode;
}

interface AccountMenuActionButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  readonly children: ReactNode;
  readonly danger?: boolean;
}

const triggerStyle = {
  alignItems: 'center',
  background: uiThemeTokens.color.surface.recessed,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.text.secondary,
  cursor: 'pointer',
  display: 'inline-flex',
  gap: uiThemeTokens.spacing.xs,
  padding: `${uiThemeTokens.spacing.xxs} ${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.xxs} ${uiThemeTokens.spacing.xxs}`,
} as const;

const dropdownStyle = {
  ...surfaceRecipes.elevated,
  background: uiThemeTokens.color.surface.canvas,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xxs,
  minWidth: '12rem',
  padding: uiThemeTokens.spacing.xs,
  position: 'absolute',
  right: 0,
  top: '100%',
  zIndex: 300,
} as const;

const menuItemStyle = {
  background: 'none',
  border: 'none',
  borderRadius: uiThemeTokens.radius.field,
  color: uiThemeTokens.color.text.primary,
  cursor: 'pointer',
  padding: `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.sm}`,
  textAlign: 'left',
  width: '100%',
} as const;

const menuDividerStyle = {
  margin: `${uiThemeTokens.spacing.xxs} 0`,
} as const;

export function AccountMenuWrapper({ children, wrapperRef }: AccountMenuWrapperProps) {
  return (
    <Box pos="relative" ref={wrapperRef}>
      {children}
    </Box>
  );
}

export function AccountMenuTriggerButton({
  children,
  type = 'button',
  ...props
}: AccountMenuTriggerButtonProps) {
  return (
    <button style={triggerStyle} type={type} {...props}>
      {children}
    </button>
  );
}

export function AccountMenuUsername({ children }: PropsWithChildren) {
  return (
    <Text c={uiThemeTokens.color.text.primary} fw={600} size="xs" span>
      {children}
    </Text>
  );
}

export function AccountMenuDropdown({ children }: PropsWithChildren) {
  return (
    <div role="menu" style={dropdownStyle}>
      {children}
    </div>
  );
}

export function AccountMenuActionButton({
  children,
  danger = false,
  type = 'button',
  ...props
}: AccountMenuActionButtonProps) {
  return (
    <button
      style={{
        ...menuItemStyle,
        color: danger ? uiThemeTokens.color.text.danger : menuItemStyle.color,
      }}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export function AccountMenuActionRow({ children }: PropsWithChildren) {
  return <ActionRow gap="sm">{children}</ActionRow>;
}

export function AccountMenuDivider() {
  return <Divider style={menuDividerStyle} />;
}
