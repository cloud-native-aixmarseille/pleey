import { Group, Text } from '@mantine/core';
import type { PropsWithChildren, ReactNode } from 'react';
import { useId } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';
import { ActionRow, ContentStack } from './containers';
import { ElevatedPanel } from './panels';
import { Eyebrow, Heading, SupportingText } from './typography';

interface SectionCardProps extends PropsWithChildren {
  readonly actions?: ReactNode;
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly footer?: ReactNode;
  readonly icon?: ReactNode;
}

export function SectionCard({
  actions,
  children,
  eyebrow,
  title,
  description,
  footer,
  icon,
}: SectionCardProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId}>
      <ElevatedPanel padding="lg">
        <ContentStack gap="md">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <Group align="flex-start" gap="md" justify="space-between" wrap="wrap">
            <Group align="flex-start" gap="sm" wrap="nowrap">
              {icon ? (
                <Text c={uiThemeTokens.color.brand.primary} component="span" span>
                  {icon}
                </Text>
              ) : null}
              <div>
                <Heading id={titleId} level={2}>
                  {title}
                </Heading>
                {description ? <SupportingText marginTop="xs">{description}</SupportingText> : null}
              </div>
            </Group>
            {actions ? <ActionRow gap="sm">{actions}</ActionRow> : null}
          </Group>
          <div>{children}</div>
          {footer ? <SupportingText tone="soft">{footer}</SupportingText> : null}
        </ContentStack>
      </ElevatedPanel>
    </section>
  );
}
