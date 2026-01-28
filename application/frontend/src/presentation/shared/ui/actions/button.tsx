import { Button as MantineButton } from '@mantine/core';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> {
  readonly intent?: 'primary' | 'success' | 'outline' | 'ghost';
  readonly leftSection?: ReactNode;
  readonly rightSection?: ReactNode;
  readonly size?: 'md' | 'sm';
  readonly width?: 'auto' | 'wide';
}

const buttonIntentProps = {
  primary: {
    color: 'brand.5',
    variant: 'filled' as const,
    styles: {
      root: {
        border: '1px solid transparent',
        boxShadow: uiThemeTokens.shadow.accentGlow,
        color: uiThemeTokens.color.text.inverse,
      },
    },
  },
  success: {
    color: 'success.5',
    variant: 'filled' as const,
    styles: {
      root: {
        border: '1px solid transparent',
        boxShadow: uiThemeTokens.shadow.successGlow,
        color: uiThemeTokens.color.text.inverse,
      },
    },
  },
  outline: {
    color: 'brand.5',
    variant: 'outline' as const,
    styles: {
      root: {
        borderColor: uiThemeTokens.color.border.accent,
        color: uiThemeTokens.color.text.primary,
      },
    },
  },
  ghost: {
    color: 'gray.1',
    variant: 'subtle' as const,
    styles: {
      root: {
        border: `1px solid ${uiThemeTokens.color.border.subtle}`,
        color: uiThemeTokens.color.text.soft,
      },
    },
  },
};

export function Button({
  intent = 'primary',
  leftSection,
  rightSection,
  size = 'md',
  type = 'button',
  width = 'auto',
  ...props
}: ButtonProps) {
  const intentProps = buttonIntentProps[intent];

  return (
    <MantineButton
      color={intentProps.color}
      leftSection={leftSection}
      radius="xl"
      rightSection={rightSection}
      size={size === 'sm' ? 'sm' : 'md'}
      styles={{
        root: {
          fontWeight: 700,
          minWidth: width === 'wide' ? '11rem' : undefined,
          ...intentProps.styles.root,
        },
        label: {
          letterSpacing: size === 'sm' ? '0.04em' : '0.02em',
        },
      }}
      type={type}
      variant={intentProps.variant}
      {...props}
    />
  );
}
