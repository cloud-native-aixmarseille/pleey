import { Box, Modal, Stack } from '@mantine/core';
import type { PropsWithChildren, ReactNode } from 'react';
import { surfaceRecipes } from '../foundation/ui-recipes';
import { uiThemeTokens } from '../foundation/ui-theme';
import { DialogActionsFooter, DialogTitleBlock } from './dialog-primitives';

interface FormDialogProps extends PropsWithChildren {
  readonly banner?: ReactNode;
  readonly eyebrow?: string;
  readonly footer: ReactNode;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  readonly title: string;
}

const accentStripStyle = {
  background: `linear-gradient(to right, ${uiThemeTokens.color.brand.primary}, ${uiThemeTokens.color.brand.accent}, transparent)`,
  flexShrink: 0,
  height: 2,
} as const;

export function FormDialog({
  banner,
  children,
  eyebrow,
  footer,
  isOpen,
  onClose,
  onSubmit,
  title,
}: FormDialogProps) {
  return (
    <Modal
      centered
      onClose={onClose}
      opened={isOpen}
      overlayProps={{
        backgroundOpacity: 0.4,
        blur: 8,
      }}
      size="xl"
      transitionProps={{
        duration: 240,
        timingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transition: 'pop',
      }}
      styles={{
        body: {
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
        },
        content: {
          ...surfaceRecipes.elevated,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
          maxWidth: '48rem',
          overflow: 'hidden',
        },
        header: {
          background: 'transparent',
          flexShrink: 0,
          padding: `${uiThemeTokens.spacing.lg} ${uiThemeTokens.spacing.xl}`,
          paddingBottom: uiThemeTokens.spacing.sm,
        },
        overlay: {
          background: `color-mix(in srgb, ${uiThemeTokens.color.surface.canvas} 78%, transparent)`,
        },
        title: {
          flex: 1,
        },
      }}
      title={<DialogTitleBlock eyebrow={eyebrow} level={2} title={title} />}
    >
      <Box
        component="form"
        display="flex"
        flex={1}
        noValidate
        onSubmit={onSubmit}
        style={{ flexDirection: 'column', overflow: 'hidden' }}
      >
        <div style={accentStripStyle} />

        <Box flex={1} px="xl" py="lg" style={{ overflowY: 'auto' }}>
          <Stack gap="md">
            {banner}
            {children}
          </Stack>
        </Box>

        <DialogActionsFooter bordered>{footer}</DialogActionsFooter>
      </Box>
    </Modal>
  );
}
