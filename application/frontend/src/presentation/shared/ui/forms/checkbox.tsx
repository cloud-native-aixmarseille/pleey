import type { CheckboxProps as MantineCheckboxProps } from '@mantine/core';
import { Checkbox as MantineCheckbox } from '@mantine/core';
import type { ReactNode } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';

interface CheckboxProps extends Omit<MantineCheckboxProps, 'label' | 'description' | 'children'> {
  readonly label?: ReactNode;
  readonly description?: ReactNode;
}

export function Checkbox({ label, description, ...props }: CheckboxProps) {
  return (
    <MantineCheckbox
      label={label}
      description={description}
      radius="md"
      size="md"
      styles={{
        root: {
          alignItems: 'flex-start',
          display: 'flex',
          gap: uiThemeTokens.spacing.sm,
        },
        input: {
          accentColor: uiThemeTokens.color.brand.primary,
          background: uiThemeTokens.color.surface.field,
          borderColor: uiThemeTokens.color.border.subtle,
          borderRadius: uiThemeTokens.radius.field,
          cursor: 'pointer',
          height: '1.25rem',
          marginTop: '0.25rem',
          minWidth: '1.25rem',
          width: '1.25rem',

          '&:checked': {
            background: uiThemeTokens.color.brand.primary,
            borderColor: uiThemeTokens.color.brand.primary,
            boxShadow: `0 0 0 4px ${uiThemeTokens.color.surface.accentMuted}`,
          },

          '&:focus': {
            boxShadow: `0 0 0 3px ${uiThemeTokens.color.surface.accentMuted}`,
            outline: 'none',
          },

          '&:disabled': {
            background: uiThemeTokens.color.surface.neutralMuted,
            borderColor: uiThemeTokens.color.border.subtle,
            cursor: 'not-allowed',
            opacity: 0.5,
          },
        },
        label: {
          color: uiThemeTokens.color.text.primary,
          cursor: 'pointer',
          fontWeight: 500,
          fontSize: '0.95rem',
          lineHeight: 1.4,
        },
        description: {
          color: uiThemeTokens.color.text.soft,
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: 400,
          lineHeight: 1.4,
          marginLeft: 0,
          marginTop: '0.25rem',
        },
      }}
      {...props}
    />
  );
}
