import { Modal, Stack } from '@mantine/core';
import type { ReactNode } from 'react';
import { Button } from '../actions/button';
import { surfaceRecipes } from '../foundation/ui-recipes';
import { uiThemeTokens } from '../foundation/ui-theme';
import { SupportingText } from '../layout/typography';
import { usePresentationMediaQuery } from '../layout/use-presentation-media-query';
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
  const isMobile = usePresentationMediaQuery();

  return (
    <Modal
      centered={!isMobile}
      onClose={onCancel}
      opened={isOpen}
      overlayProps={{
        backgroundOpacity: 0.28,
        blur: 6,
      }}
      radius={isMobile ? 'xl' : 'md'}
      styles={{
        body: {
          padding: isMobile ? uiThemeTokens.spacing.md : uiThemeTokens.spacing.lg,
        },
        content: {
          ...surfaceRecipes.elevated,
          maxWidth: isMobile ? '100%' : '28rem',
          margin: 0,
          borderRadius: isMobile
            ? `${uiThemeTokens.radius.panel} ${uiThemeTokens.radius.panel} 0 0`
            : undefined,
        },
        header: { display: 'none' },
        inner: isMobile
          ? {
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              padding: 0,
            }
          : undefined,
        overlay: {
          background: `color-mix(in srgb, ${uiThemeTokens.color.surface.canvas} 72%, transparent)`,
        },
      }}
      w="100%"
      withCloseButton={false}
    >
      <Stack gap="md" w="100%">
        <Stack gap="md">
          {title ? <DialogTitleBlock level={3} title={title} /> : null}
          <SupportingText>{message}</SupportingText>
          {children}
        </Stack>
        <DialogActionsFooter stacked={isMobile}>
          <Button
            disabled={confirmDisabled}
            intent="primary"
            onClick={onConfirm}
            width={isMobile ? 'full' : 'auto'}
          >
            {confirmLabel}
          </Button>
          <Button intent="ghost" onClick={onCancel} width={isMobile ? 'full' : 'auto'}>
            {cancelLabel}
          </Button>
        </DialogActionsFooter>
      </Stack>
    </Modal>
  );
}
