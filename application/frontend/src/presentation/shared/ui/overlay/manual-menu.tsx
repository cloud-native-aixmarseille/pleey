import { Box, Paper } from '@mantine/core';
import type { PropsWithChildren, RefObject } from 'react';
import { ContentStack } from '../layout/containers';

interface ManualMenuWrapperProps extends PropsWithChildren {
  readonly wrapperRef?: RefObject<HTMLDivElement | null>;
}

interface ManualMenuPanelProps extends PropsWithChildren {
  readonly minWidth?: string;
  readonly role?: 'menu' | 'group';
}

export function ManualMenuWrapper({ children, wrapperRef }: ManualMenuWrapperProps) {
  return (
    <Box pos="relative" ref={wrapperRef}>
      {children}
    </Box>
  );
}

export function ManualMenuPanel({
  children,
  minWidth = '13rem',
  role = 'menu',
}: ManualMenuPanelProps) {
  return (
    <Paper
      bg="var(--ui-color-surface-canvas)"
      miw={minWidth}
      p="xs"
      pos="absolute"
      radius="xl"
      right={0}
      role={role}
      shadow="xl"
      style={{ top: 'calc(100% + 0.5rem)', zIndex: 10 }}
      withBorder
    >
      <ContentStack gap="xs">{children}</ContentStack>
    </Paper>
  );
}
