import type { ComponentProps, ReactNode } from 'react';
import { Button } from './button';

interface PromptSurfaceButtonProps
  extends Omit<ComponentProps<typeof Button>, 'children' | 'fullWidth' | 'intent' | 'justify'> {
  readonly children: ReactNode;
}

export function PromptSurfaceButton({
  children,
  type = 'button',
  ...props
}: PromptSurfaceButtonProps) {
  return (
    <Button
      appearance="prompt-surface"
      fullWidth
      intent="ghost"
      justify="center"
      type={type}
      {...props}
    >
      {children}
    </Button>
  );
}
