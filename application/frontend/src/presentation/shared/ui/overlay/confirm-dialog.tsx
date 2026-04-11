import { Modal, Stack } from '@mantine/core';
import type { ReactNode } from 'react';
import { Button } from '../actions/button';
import { surfaceRecipes } from '../foundation/ui-recipes';
import { uiThemeTokens } from '../foundation/ui-theme';
import { SupportingText } from '../layout/typography';
import { DialogActionsFooter, DialogTitleBlock } from './dialog-primitives';

interface ConfirmDialogProps {
  readonly isOpen: boolean;
  readonly message: string;
  readonly confirmLabel: string;
  readonly confirmDisabled?: boolean;
  readonly cancelLabel: string;
  readonly children?: ReactNode;
  readonly title?: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  message,
  confirmLabel,
  confirmDisabled = false,
  cancelLabel,
  children,
  title,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      centered
      onClose={onCancel}
      opened={isOpen}
      overlayProps={{
        backgroundOpacity: 0.28,
        blur: 6,
      }}
      styles={{
        body: { padding: uiThemeTokens.spacing.lg },
        content: {
          ...surfaceRecipes.elevated,
          maxWidth: '28rem',
        },
        header: { display: 'none' },
        overlay: {
          background: `color-mix(in srgb, ${uiThemeTokens.color.surface.canvas} 72%, transparent)`,
        },
      }}
      withCloseButton={false}
    >
      <Stack gap="md">
        {title ? <DialogTitleBlock level={3} title={title} /> : null}
        <SupportingText>{message}</SupportingText>
        {children}
        <DialogActionsFooter>
          <Button disabled={confirmDisabled} intent="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button intent="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </DialogActionsFooter>
      </Stack>
    </Modal>
  );
}
