import type { ComponentProps, ReactNode } from 'react';
import { Button } from './button';

interface PillTriggerButtonProps
  extends Omit<ComponentProps<typeof Button>, 'children' | 'intent' | 'rootStyle'> {
  readonly children: ReactNode;
  readonly floating?: {
    readonly right: string;
    readonly top: string;
    readonly zIndex?: number;
  };
  readonly minWidth?: string;
  readonly padding?: string;
  readonly shadow?: 'none' | 'subtle';
  readonly surface?: 'panel' | 'recessed' | 'transparent';
  readonly textTone?: 'primary' | 'secondary';
  readonly width?: ComponentProps<typeof Button>['width'];
}

export function PillTriggerButton({
  children,
  floating,
  minWidth,
  padding,
  shadow = 'none',
  surface = 'transparent',
  textTone = 'primary',
  type = 'button',
  width,
  ...props
}: PillTriggerButtonProps) {
  return (
    <Button
      appearance="pill-trigger"
      appearanceShadow={shadow}
      appearanceSurface={surface}
      appearanceTextTone={textTone === 'secondary' ? 'secondary' : 'primary'}
      floating={floating}
      intent="ghost"
      minWidth={minWidth}
      padding={padding}
      size="sm"
      type={type}
      width={width}
      {...props}
    >
      {children}
    </Button>
  );
}
