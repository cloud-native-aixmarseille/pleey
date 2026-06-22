import { Box, Divider, Paper, Text } from '@mantine/core';
import type { ComponentProps, PropsWithChildren, ReactNode, RefObject } from 'react';
import { MenuActionButton } from '../../actions/menu-action-button';
import { PillTriggerButton } from '../../actions/pill-trigger-button';
import { uiThemeTokens } from '../../foundation/ui-theme';
import { ActionRow, ContentStack } from '../../layout/containers';

interface AccountMenuWrapperProps extends PropsWithChildren {
  readonly wrapperRef?: RefObject<HTMLDivElement | null>;
}

interface AccountMenuTriggerButtonProps
  extends Omit<ComponentProps<typeof PillTriggerButton>, 'children'> {
  readonly children: ReactNode;
}

interface AccountMenuActionButtonProps
  extends Omit<ComponentProps<typeof MenuActionButton>, 'children'> {
  readonly children: ReactNode;
  readonly danger?: boolean;
}

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
    <PillTriggerButton
      padding={`${uiThemeTokens.spacing.xxs} ${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.xxs} ${uiThemeTokens.spacing.xxs}`}
      surface="recessed"
      textTone="secondary"
      type={type}
      {...props}
    >
      {children}
    </PillTriggerButton>
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
    <Paper
      bg={uiThemeTokens.color.surface.canvas}
      miw="12rem"
      p="xs"
      pos="absolute"
      radius="xl"
      right={0}
      role="menu"
      shadow="xl"
      top="100%"
      withBorder
    >
      <ContentStack gap="xs">{children}</ContentStack>
    </Paper>
  );
}

export function AccountMenuActionButton({
  children,
  danger = false,
  type = 'button',
  ...props
}: AccountMenuActionButtonProps) {
  return (
    <MenuActionButton tone={danger ? 'danger' : 'default'} type={type} {...props}>
      {children}
    </MenuActionButton>
  );
}

export function AccountMenuActionRow({ children }: PropsWithChildren) {
  return <ActionRow gap="sm">{children}</ActionRow>;
}

export function AccountMenuDivider() {
  return <Divider my="xxs" />;
}
