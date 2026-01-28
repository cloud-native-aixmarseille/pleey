import type { SelectHTMLAttributes } from 'react';
import { createFieldInputStyle } from '../foundation/ui-theme';

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'style' | 'size'> {
  readonly invalid?: boolean;
}

export function Select({ invalid = false, children, ...props }: SelectProps) {
  const isAriaInvalid =
    invalid || props['aria-invalid'] === true || props['aria-invalid'] === 'true';

  return (
    <select
      aria-invalid={isAriaInvalid || undefined}
      style={{
        ...createFieldInputStyle(isAriaInvalid),
        appearance: 'none',
      }}
      {...props}
    >
      {children}
    </select>
  );
}
