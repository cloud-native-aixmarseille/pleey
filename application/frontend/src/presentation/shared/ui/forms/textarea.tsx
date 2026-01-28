import type { TextareaHTMLAttributes } from 'react';
import { createTextareaInputStyle } from '../foundation/ui-theme';

interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'style'> {
  readonly invalid?: boolean;
}

export function Textarea({ invalid = false, rows = 4, ...props }: TextareaProps) {
  const isAriaInvalid =
    invalid || props['aria-invalid'] === true || props['aria-invalid'] === 'true';

  return (
    <textarea
      aria-invalid={isAriaInvalid || undefined}
      rows={rows}
      style={createTextareaInputStyle(isAriaInvalid)}
      {...props}
    />
  );
}
