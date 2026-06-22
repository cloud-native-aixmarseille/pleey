import type { ComponentProps, ReactNode } from 'react';
import { Button } from './button';

type InteractiveSurfaceStyle = NonNullable<ComponentProps<typeof Button>['rootStyle']>;

interface InteractiveSurfaceButtonProps
  extends Omit<
    ComponentProps<typeof Button>,
    'children' | 'fullWidth' | 'intent' | 'justify' | 'rootStyle'
  > {
  readonly children: ReactNode;
  readonly surfaceStyle?: InteractiveSurfaceStyle;
}

export function InteractiveSurfaceButton({
  children,
  size = 'sm',
  surfaceStyle,
  type = 'button',
  ...props
}: InteractiveSurfaceButtonProps) {
  return (
    <Button
      appearance="interactive-surface"
      appearanceTextTone="inherit"
      fullWidth
      intent="ghost"
      justify="flex-start"
      rootStyle={surfaceStyle}
      size={size}
      type={type}
      {...props}
    >
      {children}
    </Button>
  );
}
