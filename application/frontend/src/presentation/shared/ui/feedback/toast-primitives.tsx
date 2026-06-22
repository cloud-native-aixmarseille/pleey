import { Box, Paper } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';
import { ContentStack } from '../layout/containers';

const toastViewportBehaviorStyle = {
  pointerEvents: 'none',
  zIndex: 400,
} as const;

const toastItemBehaviorStyle = {
  pointerEvents: 'auto',
} as const;

interface ToastItemShellProps extends PropsWithChildren {
  readonly testId: string;
}

export function ToastViewportShell({ children }: PropsWithChildren) {
  return (
    <Box
      maw="24rem"
      pos="fixed"
      right="var(--mantine-spacing-lg)"
      style={toastViewportBehaviorStyle}
      top="var(--mantine-spacing-lg)"
      w="calc(100vw - (2 * var(--mantine-spacing-lg)))"
    >
      <ContentStack gap="sm">{children}</ContentStack>
    </Box>
  );
}

export function ToastItemShell({ children, testId }: ToastItemShellProps) {
  return (
    <Paper
      bg={uiThemeTokens.color.surface.canvas}
      data-testid={testId}
      p={0}
      radius="xl"
      shadow="xl"
      style={toastItemBehaviorStyle}
      withBorder
    >
      {children}
    </Paper>
  );
}
