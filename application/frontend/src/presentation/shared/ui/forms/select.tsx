import { Box } from '@mantine/core';
import type { ComponentPropsWithoutRef } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';
import { AppIcon } from '../icons/app-icon';

interface SelectProps extends Omit<ComponentPropsWithoutRef<'select'>, 'size'> {
  readonly invalid?: boolean;
}

export function Select({ invalid = false, children, ...props }: SelectProps) {
  const isAriaInvalid =
    invalid || props['aria-invalid'] === true || props['aria-invalid'] === 'true';

  return (
    <Box pos="relative" w="100%">
      <Box
        {...props}
        aria-invalid={isAriaInvalid || undefined}
        component="select"
        style={{
          appearance: 'none',
          background: uiThemeTokens.color.surface.field,
          border: `1px solid ${
            isAriaInvalid ? uiThemeTokens.color.border.danger : uiThemeTokens.color.border.subtle
          }`,
          borderRadius: uiThemeTokens.radius.field,
          color: uiThemeTokens.color.text.primary,
          cursor: props.disabled ? 'not-allowed' : 'pointer',
          minHeight: '3rem',
          opacity: props.disabled ? 0.6 : 1,
          outline: 'none',
          padding: '0.9rem 2.75rem 0.9rem 1rem',
          transition: [
            `border-color ${uiThemeTokens.motion.quick}`,
            `box-shadow ${uiThemeTokens.motion.quick}`,
            `background-color ${uiThemeTokens.motion.quick}`,
            `color ${uiThemeTokens.motion.quick}`,
          ].join(', '),
          width: '100%',
        }}
      >
        {children}
      </Box>
      <Box
        aria-hidden
        c={uiThemeTokens.color.text.secondary}
        pos="absolute"
        right="md"
        style={{ pointerEvents: 'none' }}
        top="50%"
      >
        <Box style={{ transform: 'translateY(-50%)' }}>
          <AppIcon name="chevron-down" size={16} />
        </Box>
      </Box>
    </Box>
  );
}
