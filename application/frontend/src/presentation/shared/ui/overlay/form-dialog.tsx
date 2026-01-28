import { Modal, Stack } from '@mantine/core';
import type { PropsWithChildren, ReactNode } from 'react';
import { surfaceRecipes } from '../foundation/ui-recipes';
import { uiThemeTokens } from '../foundation/ui-theme';
import { uiTypeScale } from '../foundation/ui-typography';

interface FormDialogProps extends PropsWithChildren {
  readonly banner?: ReactNode;
  readonly eyebrow?: string;
  readonly footer: ReactNode;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  readonly title: string;
}

const dialogFormStyle = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  overflow: 'hidden',
} as const;

const accentStripStyle = {
  background: `linear-gradient(to right, ${uiThemeTokens.color.brand.primary}, ${uiThemeTokens.color.brand.accent}, transparent)`,
  flexShrink: 0,
  height: 2,
} as const;

const scrollAreaStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: `${uiThemeTokens.spacing.lg} ${uiThemeTokens.spacing.xl}`,
} as const;

const footerStyle = {
  alignItems: 'center',
  borderTop: `1px solid ${uiThemeTokens.color.border.subtle}`,
  display: 'flex',
  flexShrink: 0,
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'flex-end',
  padding: `${uiThemeTokens.spacing.md} ${uiThemeTokens.spacing.xl}`,
} as const;

const eyebrowStyle = {
  ...uiTypeScale.overline,
  color: uiThemeTokens.color.brand.primary,
  textTransform: 'uppercase',
} as const;

const titleTextStyle = {
  ...uiTypeScale.sectionTitle,
  color: uiThemeTokens.color.text.emphasis,
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
      title={
        <Stack gap={4}>
          {eyebrow ? <span style={eyebrowStyle}>{eyebrow}</span> : null}
          <span style={titleTextStyle}>{title}</span>
        </Stack>
      }
    >
      <form noValidate onSubmit={onSubmit} style={dialogFormStyle}>
        <div style={accentStripStyle} />

        <div style={scrollAreaStyle}>
          <Stack gap="md">
            {banner}
            {children}
          </Stack>
        </div>

        <div style={footerStyle}>{footer}</div>
      </form>
    </Modal>
  );
}
