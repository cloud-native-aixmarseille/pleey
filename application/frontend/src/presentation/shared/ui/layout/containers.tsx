import { Container, Group, type MantineBreakpoint, SimpleGrid, Stack } from '@mantine/core';
import type { PropsWithChildren } from 'react';

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

interface WrapRowProps extends PropsWithChildren {
  readonly gap?: 'xs' | 'sm' | 'md';
}

export function PageContainer({ children }: PropsWithChildren) {
  return (
    <Container px="md" py="xl" size="xl">
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

export function WrapRow({ children, gap = 'sm' }: WrapRowProps) {
  return (
    <Group gap={gap} wrap="wrap">
      {children}
    </Group>
  );
}
