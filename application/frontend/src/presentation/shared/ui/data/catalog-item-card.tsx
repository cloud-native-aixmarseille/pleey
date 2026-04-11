import { Box, Group } from '@mantine/core';
import type { ReactNode } from 'react';
import { Badge } from '../feedback/badge';
import { ActionRow, ContentStack } from '../layout/containers';
import { InsetPanel } from '../layout/panels';
import { Heading, SummaryText, SupportingText } from '../layout/typography';

interface CatalogItemCardProps {
  readonly title: string;
  readonly description?: string | null;
  readonly descriptionFallback?: string;
  readonly badge?: string;
  readonly badgeIcon?: ReactNode;
  readonly metadata?: readonly string[];
  readonly actions?: ReactNode;
  readonly children?: ReactNode;
}

export function CatalogItemCard({
  title,
  description,
  descriptionFallback,
  badge,
  badgeIcon,
  metadata,
  actions,
  children,
}: CatalogItemCardProps) {
  const displayDescription = description ?? descriptionFallback;

  return (
    <Box component="article">
      <InsetPanel padding="lg">
        <ContentStack gap="sm">
          {badge ? (
            <Group gap="xs">
              {badgeIcon}
              <Badge>{badge}</Badge>
            </Group>
          ) : null}
          <Heading level={3}>{title}</Heading>
          {displayDescription ? (
            <SupportingText tone="soft">{displayDescription}</SupportingText>
          ) : null}
          {metadata?.map((item) => (
            <SummaryText key={item}>{item}</SummaryText>
          ))}
          {children}
          {actions ? <ActionRow>{actions}</ActionRow> : null}
        </ContentStack>
      </InsetPanel>
    </Box>
  );
}
