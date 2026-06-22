import { Stack, Text } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';
import { uiTypeScale } from '../foundation/ui-typography';

interface FieldShellProps extends PropsWithChildren {
  readonly description?: string;
  readonly descriptionId?: string;
  readonly error?: string | null;
  readonly errorId?: string;
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
}

export function FieldShell({
  children,
  description,
  descriptionId,
  error,
  errorId,
  id,
  label,
  required = false,
}: FieldShellProps) {
  return (
    <Stack gap="xs">
      <Text
        c={uiThemeTokens.color.text.secondary}
        component="label"
        ff={uiTypeScale.label.fontFamily}
        fz={uiTypeScale.label.fontSize}
        fw={uiTypeScale.label.fontWeight}
        htmlFor={id}
        lh={uiTypeScale.label.lineHeight}
        lts={uiTypeScale.label.letterSpacing}
        tt="uppercase"
      >
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </Text>
      {children}
      {description ? (
        <Text
          c={uiThemeTokens.color.text.quiet}
          component="p"
          fz={uiTypeScale.caption.fontSize}
          fw={uiTypeScale.caption.fontWeight}
          id={descriptionId}
          lh={uiTypeScale.caption.lineHeight}
          lts={uiTypeScale.caption.letterSpacing}
          m={0}
        >
          {description}
        </Text>
      ) : null}
      {error ? (
        <Text
          aria-live="assertive"
          c={uiThemeTokens.color.text.danger}
          component="p"
          fz={uiTypeScale.caption.fontSize}
          fw={uiTypeScale.caption.fontWeight}
          id={errorId}
          lh={uiTypeScale.caption.lineHeight}
          lts={uiTypeScale.caption.letterSpacing}
          m={0}
          role="alert"
        >
          {error}
        </Text>
      ) : null}
    </Stack>
  );
}
