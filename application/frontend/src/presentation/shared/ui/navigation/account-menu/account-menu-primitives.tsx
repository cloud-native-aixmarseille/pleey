import { Box, Divider, Text } from '@mantine/core';
import type { ComponentProps, PropsWithChildren, ReactNode, RefObject } from 'react';
import { Button } from '../../actions/button';
import { surfaceRecipes } from '../../foundation/ui-recipes';
import { uiThemeTokens } from '../../foundation/ui-theme';
import { ActionRow } from '../../layout/containers';

interface AccountMenuWrapperProps extends PropsWithChildren {
  readonly wrapperRef?: RefObject<HTMLDivElement | null>;
}

interface AccountMenuTriggerButtonProps extends Omit<ComponentProps<typeof Button>, 'children'> {
  readonly children: ReactNode;
}

interface AccountMenuActionButtonProps extends Omit<ComponentProps<typeof Button>, 'children'> {
  readonly children: ReactNode;
  readonly danger?: boolean;
}

const triggerStyle = {
  background: uiThemeTokens.color.surface.recessed,
  '--button-bd': `1px solid ${uiThemeTokens.color.border.subtle}`,
  '--button-color': uiThemeTokens.color.text.secondary,
  '--button-hover': uiThemeTokens.color.surface.neutralMuted,
  '--button-hover-color': uiThemeTokens.color.text.primary,
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
  '--button-bd': '1px solid transparent',
  '--button-bg': 'transparent',
  '--button-color': uiThemeTokens.color.text.primary,
  '--button-hover': uiThemeTokens.color.surface.recessed,
  '--button-hover-color': uiThemeTokens.color.text.primary,
  borderRadius: uiThemeTokens.radius.field,
  justifyContent: 'flex-start',
  padding: `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.sm}`,
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
    <Button intent="ghost" rootStyle={triggerStyle} size="sm" type={type} {...props}>
      {children}
    </Button>
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
    <Button
      fullWidth
      intent="ghost"
      labelStyle={{ textAlign: 'left', width: '100%' }}
      rootStyle={{
        ...menuItemStyle,
        '--button-color': danger
          ? uiThemeTokens.color.text.danger
          : uiThemeTokens.color.text.primary,
      }}
      size="sm"
      type={type}
      {...props}
    >
      {children}
    </Button>
  );
}

export function AccountMenuActionRow({ children }: PropsWithChildren) {
  return <ActionRow gap="sm">{children}</ActionRow>;
}

export function AccountMenuDivider() {
  return <Divider style={menuDividerStyle} />;
}
