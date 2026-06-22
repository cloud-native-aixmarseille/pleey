import { Center, Text } from '@mantine/core';
import type { ReactNode } from 'react';
import { Badge } from '../feedback/badge';
import { uiThemeTokens } from '../foundation/ui-theme';
import { ActionRow, ContentStack } from '../layout/containers';
import { InsetPanel } from '../layout/panels';
import { UserAvatar } from './user-avatar';

interface ProfileTileProps {
  readonly avatarAlt: string;
  readonly avatarSrc?: string | null;
  readonly badgeLabel: string;
  readonly footerAction?: ReactNode;
  readonly highlighted?: boolean;
  readonly highlightLabel?: string;
  readonly title: string;
}

export function ProfileTile({
  avatarAlt,
  avatarSrc,
  badgeLabel,
  footerAction,
  highlighted = false,
  highlightLabel,
  title,
}: ProfileTileProps) {
  return (
    <InsetPanel padding="md" tone={highlighted ? 'accent' : 'default'}>
      <ContentStack align="center" gap="xs">
        <Center data-testid="profile-tile-highlight-slot" mih="1.5rem" w="100%">
          {highlightLabel ? (
            <ActionRow justify="center">
              <Badge tone="success">{highlightLabel}</Badge>
            </ActionRow>
          ) : null}
        </Center>
        <UserAvatar alt={avatarAlt} size={56} src={avatarSrc} />
        <Text
          c={uiThemeTokens.color.text.primary}
          component="p"
          fw={600}
          m={0}
          maw="100%"
          ta="center"
          truncate="end"
          w="100%"
        >
          {title}
        </Text>
        <Badge tone={highlighted ? 'accent' : 'neutral'}>{badgeLabel}</Badge>
        {footerAction ? <ActionRow justify="center">{footerAction}</ActionRow> : null}
      </ContentStack>
    </InsetPanel>
  );
}
