import { MultiSelect as MantineMultiSelect, type MultiSelectProps } from '@mantine/core';

export type { MultiSelectProps };

export function MultiSelect(props: MultiSelectProps) {
  return <MantineMultiSelect {...props} />;
}
