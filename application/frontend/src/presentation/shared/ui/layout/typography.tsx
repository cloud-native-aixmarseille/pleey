import { List, Text, Title } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import {
  createEyebrowTextStyle,
  createHeadingStyle,
  emphasizedSummaryTextStyle,
  uiThemeTokens,
} from '../foundation/ui-theme';

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

interface BulletListProps {
  readonly items: readonly string[];
}

export function Eyebrow({ children, tone = 'accent', compact = false }: EyebrowProps) {
  return (
    <Text component="p" style={createEyebrowTextStyle({ compact, tone })}>
      {children}
    </Text>
  );
}

export function Heading({ children, id, level = 2, hero = false }: HeadingProps) {
  const fontSize = hero ? 'clamp(2rem, 3vw, 2.75rem)' : level === 3 ? '1.25rem' : '2rem';

  return (
    <Title
      id={id}
      order={level}
      style={createHeadingStyle({ fontSize, lineHeight: hero ? 1.1 : 1.15 })}
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
    <Text component="p" style={emphasizedSummaryTextStyle}>
      {children}
    </Text>
  );
}

export function BulletList({ items }: BulletListProps) {
  return (
    <List c={uiThemeTokens.color.text.secondary} size="sm" spacing="sm" withPadding>
      {items.map((item) => (
        <List.Item key={item}>{item}</List.Item>
      ))}
    </List>
  );
}
