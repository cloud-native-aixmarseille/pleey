import { Text, Title } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';

interface EyebrowProps extends PropsWithChildren {
  readonly tone?: 'accent' | 'success';
  readonly compact?: boolean;
}

interface HeadingProps extends PropsWithChildren {
  readonly id?: string;
  readonly level?: 1 | 2 | 3;
  readonly hero?: boolean;
}

interface SupportingTextProps extends PropsWithChildren {
  readonly tone?: 'muted' | 'soft';
  readonly size?: 'sm' | 'md';
  readonly marginTop?: 'none' | 'xs' | 'sm' | 'md';
  readonly maxWidth?: number;
}

export function Eyebrow({ children, tone = 'accent', compact = false }: EyebrowProps) {
  return (
    <Text
      c={tone === 'success' ? uiThemeTokens.color.brand.success : uiThemeTokens.color.brand.primary}
      component="p"
      ff={uiThemeTokens.typography.overlineFamily}
      fs="normal"
      fz="0.55rem"
      fw={400}
      lh={1.4}
      lts={compact ? '0.32rem' : '0.35rem'}
      m={0}
      tt="uppercase"
    >
      {children}
    </Text>
  );
}

export function Heading({ children, id, level = 2, hero = false }: HeadingProps) {
  const fontSize = hero ? 'clamp(2rem, 3vw, 2.75rem)' : level === 3 ? '1.25rem' : '2rem';

  return (
    <Title
      c={uiThemeTokens.color.text.emphasis}
      fz={fontSize}
      id={id}
      lh={hero ? 1.1 : 1.15}
      order={level}
    >
      {children}
    </Title>
  );
}

export function SupportingText({
  children,
  tone = 'muted',
  size = 'sm',
  marginTop = 'none',
  maxWidth,
}: SupportingTextProps) {
  const color =
    tone === 'soft' ? uiThemeTokens.color.text.soft : uiThemeTokens.color.text.secondary;
  const mt = marginTop === 'none' ? undefined : marginTop;

  return (
    <Text c={color} maw={maxWidth} mt={mt} size={size}>
      {children}
    </Text>
  );
}

export function SummaryText({ children }: PropsWithChildren) {
  return (
    <Text c={uiThemeTokens.color.text.emphasis} component="p" fz="0.875rem" fw={600} m={0}>
      {children}
    </Text>
  );
}
