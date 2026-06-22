import type { ButtonProps as MantineButtonProps } from '@mantine/core';
import { Button as MantineButton } from '@mantine/core';
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ReactNode } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';

type ButtonIntent = 'primary' | 'secondary' | 'ghost';
type ButtonIntentCompat = ButtonIntent | 'outline';
type ButtonAppearance =
  | 'default'
  | 'interactive-surface'
  | 'menu-action'
  | 'pill-trigger'
  | 'prompt-surface'
  | 'underline-tab';
type ButtonAppearanceSurface = 'panel' | 'recessed' | 'transparent';
type ButtonAppearanceShadow = 'none' | 'subtle';
type ButtonAppearanceTextTone = 'danger' | 'inherit' | 'primary' | 'secondary' | 'soft';

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
  readonly appearance?: ButtonAppearance;
  readonly appearanceShadow?: ButtonAppearanceShadow;
  readonly appearanceSurface?: ButtonAppearanceSurface;
  readonly appearanceTextTone?: ButtonAppearanceTextTone;
  readonly appearanceActive?: boolean;
  readonly floating?: {
    readonly right: string;
    readonly top: string;
    readonly zIndex?: number;
  };
  readonly intent?: ButtonIntentCompat;
  readonly leftSection?: ReactNode;
  readonly labelStyle?: InlineStyle;
  readonly minWidth?: string;
  readonly padding?: string;
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

function resolveAppearanceSurfaceColor(surface: ButtonAppearanceSurface) {
  if (surface === 'panel') {
    return uiThemeTokens.color.surface.panel;
  }

  if (surface === 'recessed') {
    return uiThemeTokens.color.surface.recessed;
  }

  return 'transparent';
}

function resolveAppearanceHoverColor(surface: ButtonAppearanceSurface) {
  if (surface === 'panel') {
    return uiThemeTokens.color.surface.recessed;
  }

  return uiThemeTokens.color.surface.neutralMuted;
}

function resolveAppearanceTextColor(textTone: ButtonAppearanceTextTone) {
  if (textTone === 'danger') {
    return uiThemeTokens.color.text.danger;
  }

  if (textTone === 'inherit') {
    return 'inherit';
  }

  if (textTone === 'secondary') {
    return uiThemeTokens.color.text.secondary;
  }

  if (textTone === 'soft') {
    return uiThemeTokens.color.text.soft;
  }

  return uiThemeTokens.color.text.primary;
}

function resolveAppearanceRootStyle({
  appearance,
  appearanceShadow,
  appearanceSurface,
  appearanceTextTone,
  appearanceActive,
  floating,
  minWidth,
  padding,
}: {
  readonly appearance: ButtonAppearance;
  readonly appearanceShadow: ButtonAppearanceShadow;
  readonly appearanceSurface: ButtonAppearanceSurface;
  readonly appearanceTextTone: ButtonAppearanceTextTone;
  readonly appearanceActive?: boolean;
  readonly floating?: ButtonProps['floating'];
  readonly minWidth?: string;
  readonly padding?: string;
}): ButtonStyleVars {
  if (appearance === 'menu-action') {
    return {
      '--button-bd': '1px solid transparent',
      '--button-bg': 'transparent',
      '--button-color': resolveAppearanceTextColor(appearanceTextTone),
      '--button-hover': uiThemeTokens.color.surface.recessed,
      '--button-hover-color': uiThemeTokens.color.text.primary,
      borderRadius: uiThemeTokens.radius.field,
      justifyContent: 'flex-start',
      padding: padding ?? `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.sm}`,
    };
  }

  if (appearance === 'pill-trigger') {
    const background = resolveAppearanceSurfaceColor(appearanceSurface);

    return {
      '--button-bd': `1px solid ${uiThemeTokens.color.border.subtle}`,
      '--button-bg': background,
      '--button-color': resolveAppearanceTextColor(appearanceTextTone),
      '--button-hover': resolveAppearanceHoverColor(appearanceSurface),
      '--button-hover-color': uiThemeTokens.color.text.primary,
      background,
      borderRadius: uiThemeTokens.radius.pill,
      boxShadow: appearanceShadow === 'subtle' ? uiThemeTokens.shadow.subtle : 'none',
      minWidth,
      padding,
      ...(floating
        ? {
            position: 'absolute',
            right: floating.right,
            top: floating.top,
            zIndex: floating.zIndex ?? 1,
          }
        : null),
    };
  }

  if (appearance === 'prompt-surface') {
    return {
      '--button-bd': '1px solid transparent',
      '--button-bg': 'transparent',
      '--button-color': uiThemeTokens.color.text.primary,
      '--button-hover': 'transparent',
      '--button-hover-color': uiThemeTokens.color.text.primary,
      boxShadow: 'none',
      padding: padding ?? `${uiThemeTokens.spacing.xl} ${uiThemeTokens.spacing.lg}`,
      width: '100%',
    };
  }

  if (appearance === 'interactive-surface') {
    return {
      '--button-bd': '1px solid transparent',
      '--button-bg': 'transparent',
      '--button-color': resolveAppearanceTextColor(appearanceTextTone),
      '--button-hover': 'transparent',
      '--button-hover-color': resolveAppearanceTextColor(appearanceTextTone),
      appearance: 'none',
      justifyContent: 'flex-start',
      lineHeight: 'inherit',
      textAlign: 'left',
    };
  }

  if (appearance === 'underline-tab') {
    return {
      background: appearanceActive
        ? `color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 14%, transparent)`
        : 'transparent',
      border: 0,
      borderBottom: appearanceActive
        ? `2px solid ${uiThemeTokens.color.brand.primary}`
        : '2px solid transparent',
      color: appearanceActive ? uiThemeTokens.color.text.link : 'inherit',
      cursor: 'pointer',
      fontWeight: 700,
      minHeight: '3rem',
      padding: padding ?? '0.95rem',
    };
  }

  return {};
}

export function Button({
  appearance = 'default',
  appearanceActive,
  appearanceShadow = 'none',
  appearanceSurface = 'transparent',
  appearanceTextTone = 'primary',
  floating,
  intent = 'primary',
  leftSection,
  labelStyle,
  minWidth,
  padding,
  rootStyle,
  rightSection,
  size = 'md',
  type = 'button',
  width = 'auto',
  ...props
}: ButtonProps) {
  const resolvedIntent = resolveButtonIntent(intent);
  const intentProps = buttonIntentProps[resolvedIntent];
  const appearanceRootStyle = resolveAppearanceRootStyle({
    appearance,
    appearanceActive,
    appearanceShadow,
    appearanceSurface,
    appearanceTextTone,
    floating,
    minWidth,
    padding,
  });

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
          minWidth: minWidth ?? (width === 'wide' ? '11rem' : undefined),
          transition: 'background-color var(--ui-motion-quick), color var(--ui-motion-quick)',
          width: width === 'full' ? '100%' : undefined,
          ...intentProps.root,
          ...appearanceRootStyle,
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
