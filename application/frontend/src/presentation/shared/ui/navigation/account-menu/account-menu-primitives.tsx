import { Box, Divider, Button as MantineButton, Paper, Text } from '@mantine/core';
import type { ComponentProps, PropsWithChildren, ReactNode, RefObject } from 'react';
import { MenuActionButton } from '../../actions/menu-action-button';
import { PillTriggerButton } from '../../actions/pill-trigger-button';
import { uiThemeTokens } from '../../foundation/ui-theme';
import { ActionRow, ContentStack } from '../../layout/containers';

interface AccountMenuWrapperProps extends PropsWithChildren {
  readonly wrapperRef?: RefObject<HTMLDivElement | null>;
}

interface AccountMenuTriggerButtonProps extends Omit<ComponentProps<typeof PillTriggerButton>, 'children'> {
  readonly children: ReactNode;
}

interface AccountMenuActionButtonProps extends Omit<ComponentProps<typeof MenuActionButton>, 'children'> {
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

export function AccountMenuTriggerButton({ children, type = 'button', ...props }: AccountMenuTriggerButtonProps) {
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
      miw="14rem"
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

export function AccountMenuExternalAnchor({ children, href }: { readonly children: ReactNode; readonly href: string }) {
  return (
    <MantineButton
      component="a"
      fullWidth
      href={href}
      justify="flex-start"
      rel="noopener noreferrer"
      role="menuitem"
      size="sm"
      styles={{
        root: {
          '--button-bd': '1px solid transparent',
          '--button-bg': 'transparent',
          '--button-color': uiThemeTokens.color.text.primary,
          '--button-hover': uiThemeTokens.color.surface.recessed,
          '--button-hover-color': uiThemeTokens.color.text.primary,
          borderRadius: uiThemeTokens.radius.field,
          padding: `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.sm}`,
          textDecoration: 'none',
        },
      }}
      target="_blank"
      variant="subtle"
    >
      {children}
    </MantineButton>
  );
}

export function AccountMenuFooter({ children }: PropsWithChildren) {
  return (
    <Box
      px="xs"
      style={{
        alignItems: 'center',
        display: 'grid',
        gap: uiThemeTokens.spacing.sm,
        gridTemplateColumns: 'minmax(0, 1fr) auto',
      }}
    >
      {children}
    </Box>
  );
}

export function AccountMenuFooterLink({
  children,
  href,
  label,
}: {
  readonly children: ReactNode;
  readonly href: string;
  readonly label: string;
}) {
  return (
    <Box
      aria-label={label}
      component="a"
      href={href}
      rel="noopener noreferrer"
      role="menuitem"
      style={{
        alignItems: 'center',
        borderRadius: uiThemeTokens.radius.field,
        color: uiThemeTokens.color.text.primary,
        display: 'inline-flex',
        flexShrink: 0,
        fontSize: '0.75rem',
        fontWeight: 600,
        gap: uiThemeTokens.spacing.xxs,
        lineHeight: 1,
        minWidth: 'max-content',
        padding: `${uiThemeTokens.spacing.xxs} ${uiThemeTokens.spacing.xs}`,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
      target="_blank"
      title={label}
    >
      {children}
    </Box>
  );
}

export function AccountMenuActionRow({ children }: PropsWithChildren) {
  return <ActionRow gap="sm">{children}</ActionRow>;
}

export function AccountMenuDivider() {
  return <Divider my="xxs" />;
}

export function AccountMenuMetaText({ children }: PropsWithChildren) {
  return (
    <Text c={uiThemeTokens.color.text.secondary} px={0} size="xs" ta="left">
      {children}
    </Text>
  );
}
