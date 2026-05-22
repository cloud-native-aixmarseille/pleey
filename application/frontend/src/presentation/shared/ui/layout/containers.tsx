import { Box, Container, Group, type MantineBreakpoint, SimpleGrid, Stack } from '@mantine/core';
import type { PropsWithChildren } from 'react';

interface PageContainerProps extends PropsWithChildren {
  readonly maxWidth?: string;
}

type ResponsiveColumns = Partial<Record<MantineBreakpoint, number>> & {
  readonly base: 1 | 2 | 3;
};

interface ResponsiveGridProps extends PropsWithChildren {
  readonly columns: ResponsiveColumns;
  readonly gap?: 'sm' | 'md' | 'lg' | 'xl';
}

interface ActionRowProps extends PropsWithChildren {
  readonly gap?: 'sm' | 'md' | 'lg';
  readonly justify?: 'start' | 'center' | 'end';
}

interface ContentStackProps extends PropsWithChildren {
  readonly align?: 'center' | 'stretch';
  readonly gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  readonly marginTop?: 'none' | 'xs' | 'sm' | 'md';
}

interface SectionContainerProps extends PropsWithChildren {
  readonly centered?: boolean;
  readonly gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  readonly maxWidth?: string;
}

interface WrapRowProps extends PropsWithChildren {
  readonly gap?: 'xs' | 'sm' | 'md';
  readonly wrap?: 'nowrap' | 'wrap';
}

interface SplitWrapRowProps extends PropsWithChildren {
  readonly align?: 'baseline' | 'center' | 'start';
  readonly gap?: 'xs' | 'sm' | 'md' | 'lg';
}

interface AutoFillGridProps extends PropsWithChildren {
  readonly gap?: 'sm' | 'md' | 'lg';
  readonly minItemWidth: string;
}

const autoFillGridStyle = {
  display: 'grid',
  width: '100%',
} as const;

export function PageContainer({ children, maxWidth = 'xl' }: PageContainerProps) {
  return (
    <Container px="md" py="xl" size={maxWidth} w="100%">
      <Stack gap="xl">{children}</Stack>
    </Container>
  );
}

export function ResponsiveGrid({ children, columns, gap = 'lg' }: ResponsiveGridProps) {
  return (
    <SimpleGrid cols={columns} spacing={gap}>
      {children}
    </SimpleGrid>
  );
}

export function ActionRow({ children, gap = 'sm', justify }: ActionRowProps) {
  const justifyValue = justify === 'center' ? 'center' : justify === 'end' ? 'flex-end' : undefined;

  return (
    <Group gap={gap} justify={justifyValue}>
      {children}
    </Group>
  );
}

export function ContentStack({
  align,
  children,
  gap = 'md',
  marginTop = 'none',
}: ContentStackProps) {
  const mt = marginTop === 'none' ? undefined : marginTop;

  return (
    <Stack align={align} gap={gap} mt={mt}>
      {children}
    </Stack>
  );
}

export function SectionContainer({
  centered = false,
  children,
  gap = 'md',
  maxWidth = '50rem',
}: SectionContainerProps) {
  return (
    <Stack
      align={centered ? 'center' : undefined}
      gap={gap}
      maw={maxWidth}
      mx="auto"
      px="sm"
      w="100%"
    >
      {children}
    </Stack>
  );
}

export function WrapRow({ children, gap = 'sm', wrap = 'wrap' }: WrapRowProps) {
  return (
    <Group gap={gap} wrap={wrap}>
      {children}
    </Group>
  );
}

export function SplitWrapRow({ children, align = 'center', gap = 'md' }: SplitWrapRowProps) {
  const alignValue = align === 'start' ? 'flex-start' : align;

  return (
    <Group align={alignValue} gap={gap} justify="space-between" wrap="wrap">
      {children}
    </Group>
  );
}

export function AutoFillGrid({ children, gap = 'md', minItemWidth }: AutoFillGridProps) {
  return (
    <Box
      style={{
        ...autoFillGridStyle,
        gap: `var(--mantine-spacing-${gap})`,
        gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`,
      }}
    >
      {children}
    </Box>
  );
}
