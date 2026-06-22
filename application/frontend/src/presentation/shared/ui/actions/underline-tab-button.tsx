import { Text } from '@mantine/core';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from './button';

interface UnderlineTabButtonProps
  extends Omit<
    ComponentProps<typeof Button>,
    'children' | 'fullWidth' | 'intent' | 'justify' | 'rootStyle'
  > {
  readonly active: boolean;
  readonly children: ReactNode;
}

export function UnderlineTabButton({
  active,
  children,
  size = 'sm',
  type = 'button',
  ...props
}: UnderlineTabButtonProps) {
  return (
    <Button
      appearance="underline-tab"
      appearanceActive={active}
      fullWidth
      intent={active ? 'secondary' : 'ghost'}
      justify="center"
      size={size}
      type={type}
      {...props}
    >
      <Text component="span" display="block" ta="center">
        {children}
      </Text>
    </Button>
  );
}
