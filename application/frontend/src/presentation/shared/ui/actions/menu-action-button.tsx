import type { ComponentProps } from 'react';
import { Button } from './button';

interface MenuActionButtonProps extends Omit<ComponentProps<typeof Button>, 'children'> {
  readonly children: ComponentProps<typeof Button>['children'];
  readonly tone?: 'danger' | 'default';
}

export function MenuActionButton({
  children,
  size = 'sm',
  tone = 'default',
  type = 'button',
  ...props
}: MenuActionButtonProps) {
  return (
    <Button
      appearance="menu-action"
      appearanceTextTone={tone === 'danger' ? 'danger' : 'primary'}
      fullWidth
      intent="ghost"
      justify="flex-start"
      size={size}
      type={type}
      {...props}
    >
      {children}
    </Button>
  );
}
