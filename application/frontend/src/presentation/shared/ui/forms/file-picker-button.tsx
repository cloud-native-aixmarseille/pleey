import {
  FileButton as MantineFileButton,
  type FileButtonProps as MantineFileButtonProps,
} from '@mantine/core';
import { type ReactNode, useRef } from 'react';

interface FilePickerButtonProps
  extends Omit<MantineFileButtonProps<false>, 'children' | 'onChange' | 'resetRef'> {
  readonly children: (props: { readonly onClick: () => void }) => ReactNode;
  readonly onSelect: (file: File | null) => void;
}

export function FilePickerButton({ children, onSelect, ...props }: FilePickerButtonProps) {
  const resetRef = useRef<() => void>(null);

  return (
    <MantineFileButton
      {...props}
      onChange={(file) => {
        onSelect(file);
        resetRef.current?.();
      }}
      resetRef={resetRef}
    >
      {children}
    </MantineFileButton>
  );
}
