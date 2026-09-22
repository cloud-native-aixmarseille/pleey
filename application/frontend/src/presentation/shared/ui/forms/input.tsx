import { TextInput as MantineTextInput, type TextInputProps as MantineTextInputProps } from '@mantine/core';

interface InputProps extends Omit<MantineTextInputProps, 'className' | 'size' | 'styles' | 'variant'> {
  readonly invalid?: boolean;
  readonly compact?: boolean;
}

export function Input({ invalid = false, compact = false, ...props }: InputProps) {
  const isAriaInvalid = invalid || props['aria-invalid'] === true || props['aria-invalid'] === 'true';

  return (
    <MantineTextInput
      aria-invalid={isAriaInvalid || undefined}
      error={isAriaInvalid}
      size={compact ? 'sm' : 'md'}
      variant="default"
      {...props}
      attributes={{
        ...props.attributes,
        input: {
          ...props.attributes?.input,
          // FieldShell owns descriptions and errors outside Mantine's input wrapper.
          ...(props['aria-describedby'] ? { 'aria-describedby': props['aria-describedby'] } : {}),
        },
      }}
    />
  );
}
