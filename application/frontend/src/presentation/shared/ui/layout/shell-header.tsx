import { Group, Stack } from '@mantine/core';
import type { ReactNode } from 'react';
import { ElevatedPanel } from './panels';
import { Eyebrow, Heading, SupportingText } from './typography';

interface ShellHeaderProps {
  readonly kicker: string;
  readonly title: string;
  readonly subtitle: string;
  readonly navigation: ReactNode;
}

export function ShellHeader({ kicker, title, subtitle, navigation }: ShellHeaderProps) {
  return (
    <header>
      <ElevatedPanel padding="lg">
        <Group align="flex-start" gap="xl" justify="space-between" wrap="wrap">
          <Stack gap="xs" maw="48rem">
            <Eyebrow>{kicker}</Eyebrow>
            <Heading hero level={1}>
              {title}
            </Heading>
            <SupportingText maxWidth={768} size="md">
              {subtitle}
            </SupportingText>
          </Stack>
          {navigation}
        </Group>
      </ElevatedPanel>
    </header>
  );
}
