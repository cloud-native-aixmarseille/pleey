import { Group, Stack } from '@mantine/core';
import type { ReactNode } from 'react';
import { ElevatedPanel } from './panels';
import { Eyebrow, Heading, SupportingText } from './typography';

interface SubpageHeaderProps {
  readonly kicker: string;
  readonly title: string;
  readonly subtitle: string;
  readonly actions?: ReactNode;
}

export function SubpageHeader({ kicker, title, subtitle, actions }: SubpageHeaderProps) {
  return (
    <header>
      <ElevatedPanel padding="lg">
        <Group align="flex-start" gap="xl" justify="space-between" wrap="wrap">
          <Stack gap="xs" maw="48rem">
            <Eyebrow>{kicker}</Eyebrow>
            <Heading level={2}>{title}</Heading>
            <SupportingText maxWidth={768} size="md">
              {subtitle}
            </SupportingText>
          </Stack>
          {actions ? (
            <Group gap="sm" wrap="nowrap">
              {actions}
            </Group>
          ) : null}
        </Group>
      </ElevatedPanel>
    </header>
  );
}
