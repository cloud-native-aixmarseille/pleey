import { Drawer, Text } from '@mantine/core';
import type { ReactNode } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';

interface DrawerPanelProps {
  readonly children: ReactNode;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly position?: 'bottom' | 'left' | 'right' | 'top';
  readonly size?: string | number;
  readonly title: ReactNode;
}

const drawerOverlayStyle = {
  backdropFilter: 'blur(6px)',
  background: uiThemeTokens.color.surface.overlay,
} as const;

export function DrawerPanel({
  children,
  isOpen,
  onClose,
  position = 'right',
  size = '100%',
  title,
}: DrawerPanelProps) {
  return (
    <Drawer
      onClose={onClose}
      opened={isOpen}
      overlayProps={{ style: drawerOverlayStyle }}
      position={position}
      size={size}
      styles={{
        body: { background: uiThemeTokens.color.surface.canvas, flex: 1 },
        content: { display: 'flex', flexDirection: 'column' },
        header: { background: uiThemeTokens.color.surface.canvas },
      }}
      title={
        <Text
          c={uiThemeTokens.color.text.emphasis}
          ff={uiThemeTokens.typography.displayFamily}
          fz="1rem"
          fw={700}
          lh={1.3}
          lts="0.01em"
        >
          {title}
        </Text>
      }
    >
      {children}
    </Drawer>
  );
}
