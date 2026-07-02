import { Box, Paper } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';
import { ContentStack } from '../layout/containers';
import { usePresentationMediaQuery } from '../layout/use-presentation-media-query';

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
  const isMobile = usePresentationMediaQuery('(max-width: 48em)');

  return (
    <Box
      data-testid="presentation-toast-viewport"
      maw="24rem"
      pos="fixed"
      style={{
        ...toastViewportBehaviorStyle,
        ...(isMobile
          ? {
              bottom: 'max(var(--mantine-spacing-lg), env(safe-area-inset-bottom))',
              left: '50%',
              right: 'auto',
              top: 'auto',
              transform: 'translateX(-50%)',
            }
          : {
              right: 'var(--mantine-spacing-lg)',
              top: 'var(--mantine-spacing-lg)',
            }),
      }}
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
