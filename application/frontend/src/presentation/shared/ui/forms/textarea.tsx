import {
  Textarea as MantineTextarea,
  type TextareaProps as MantineTextareaProps,
} from '@mantine/core';

interface TextareaProps extends Omit<MantineTextareaProps, 'className' | 'styles' | 'variant'> {
  readonly invalid?: boolean;
}

export function Textarea({ invalid = false, rows = 4, ...props }: TextareaProps) {
  const isAriaInvalid =
    invalid || props['aria-invalid'] === true || props['aria-invalid'] === 'true';

  return (
    <MantineTextarea
      aria-invalid={isAriaInvalid || undefined}
      error={isAriaInvalid}
      rows={rows}
      variant="default"
      {...props}
    />
  );
}
