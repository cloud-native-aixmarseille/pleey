import type { InputHTMLAttributes } from 'react';
import { createFieldInputStyle } from '../foundation/ui-theme';

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size' | 'style'> {
  readonly invalid?: boolean;
}

export function Input({ invalid = false, ...props }: InputProps) {
  const isAriaInvalid =
    invalid || props['aria-invalid'] === true || props['aria-invalid'] === 'true';

  return (
    <input
      aria-invalid={isAriaInvalid || undefined}
      style={createFieldInputStyle(isAriaInvalid)}
      {...props}
    />
  );
}
