import type { CheckboxProps as MantineCheckboxProps } from '@mantine/core';
import { Checkbox as MantineCheckbox } from '@mantine/core';
import type { ReactNode } from 'react';

interface CheckboxProps extends Omit<MantineCheckboxProps, 'label' | 'description' | 'children'> {
  readonly label?: ReactNode;
  readonly description?: ReactNode;
}

export function Checkbox({ label, description, ...props }: CheckboxProps) {
  return <MantineCheckbox description={description} label={label} {...props} />;
}
