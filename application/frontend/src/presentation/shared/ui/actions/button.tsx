import type { ButtonProps as MantineButtonProps } from '@mantine/core';
import { Button as MantineButton } from '@mantine/core';
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ReactNode } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';

type ButtonIntent = 'primary' | 'secondary' | 'ghost';
type ButtonIntentCompat = ButtonIntent | 'outline';

type InlineStyle = NonNullable<ComponentPropsWithoutRef<'button'>['style']>;

type ButtonStyleVars = InlineStyle &
  Partial<
    Record<
      '--button-bg' | '--button-hover' | '--button-color' | '--button-hover-color' | '--button-bd',
      string
    >
  >;

interface ButtonProps
  extends Omit<
      MantineButtonProps,
      'className' | 'color' | 'radius' | 'style' | 'styles' | 'variant'
    >,
    Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'className' | 'style' | 'type'> {
  readonly intent?: ButtonIntentCompat;
  readonly leftSection?: ReactNode;
  readonly labelStyle?: InlineStyle;
  readonly rightSection?: ReactNode;
  readonly rootStyle?: ButtonStyleVars;
  readonly size?: 'md' | 'sm';
  readonly type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  readonly width?: 'auto' | 'wide' | 'full';
}

const buttonIntentProps: Record<
  ButtonIntent,
  {
    readonly color?: string;
    readonly variant: MantineButtonProps['variant'];
    readonly root: ButtonStyleVars;
  }
> = {
  primary: {
    color: 'brand.5',
    variant: 'filled',
    root: {
      '--button-bd': '1px solid transparent',
      '--button-bg': 'light-dark(var(--mantine-color-brand-7), var(--mantine-color-brand-5))',
      '--button-color': uiThemeTokens.color.text.onAction,
      '--button-hover': 'light-dark(var(--mantine-color-brand-8), var(--mantine-color-brand-4))',
      '--button-hover-color': uiThemeTokens.color.text.onAction,
      boxShadow: uiThemeTokens.shadow.accentGlow,
    },
  },
  secondary: {
    color: 'brand.5',
    variant: 'outline',
    root: {
      '--button-bd': `1px solid ${uiThemeTokens.color.border.accent}`,
      '--button-bg': 'transparent',
      '--button-color': uiThemeTokens.color.text.primary,
      '--button-hover': uiThemeTokens.color.surface.accentMuted,
      '--button-hover-color': uiThemeTokens.color.text.primary,
    },
  },
  ghost: {
    variant: 'subtle',
    root: {
      '--button-bd': `1px solid ${uiThemeTokens.color.border.subtle}`,
      '--button-bg': 'transparent',
      '--button-color': uiThemeTokens.color.text.soft,
      '--button-hover': uiThemeTokens.color.surface.neutralMuted,
      '--button-hover-color': uiThemeTokens.color.text.primary,
    },
  },
};

function resolveButtonIntent(intent: ButtonIntentCompat): ButtonIntent {
  return intent === 'outline' ? 'secondary' : intent;
}

export function Button({
  intent = 'primary',
  leftSection,
  labelStyle,
  rootStyle,
  rightSection,
  size = 'md',
  type = 'button',
  width = 'auto',
  ...props
}: ButtonProps) {
  const resolvedIntent = resolveButtonIntent(intent);
  const intentProps = buttonIntentProps[resolvedIntent];

  return (
    <MantineButton
      color={intentProps.color}
      leftSection={leftSection}
      aria-busy={props.loading ? true : undefined}
      radius="xl"
      rightSection={rightSection}
      size={size === 'sm' ? 'sm' : 'md'}
      styles={{
        root: {
          fontWeight: 700,
          minWidth: width === 'wide' ? '11rem' : undefined,
          transition: 'background-color var(--ui-motion-quick), color var(--ui-motion-quick)',
          width: width === 'full' ? '100%' : undefined,
          ...intentProps.root,
          ...rootStyle,
        },
        label: {
          letterSpacing: size === 'sm' ? '0.04em' : '0.02em',
          ...labelStyle,
        },
      }}
      type={type}
      variant={intentProps.variant}
      {...props}
    />
  );
}
