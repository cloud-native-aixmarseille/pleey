import type { ComponentProps, ReactNode } from 'react';
import { PillTriggerButton } from './pill-trigger-button';

interface IconTriggerButtonProps
  extends Omit<ComponentProps<typeof PillTriggerButton>, 'children'> {
  readonly children: ReactNode;
  readonly paddingX?: string;
}

export function IconTriggerButton({ children, paddingX, ...props }: IconTriggerButtonProps) {
  return (
    <PillTriggerButton padding={paddingX ? `0 ${paddingX}` : undefined} {...props}>
      {children}
    </PillTriggerButton>
  );
}
