import { Text } from '@mantine/core';
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

const profileTitleStyle = {
  color: uiThemeTokens.color.text.primary,
  fontWeight: 600,
  margin: 0,
  maxWidth: '100%',
  overflow: 'hidden',
  textAlign: 'center',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

const highlightSlotStyle = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  minHeight: '1.5rem',
  width: '100%',
} as const;

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
        <div data-testid="profile-tile-highlight-slot" style={highlightSlotStyle}>
          {highlightLabel ? (
            <ActionRow justify="center">
              <Badge tone="success">{highlightLabel}</Badge>
            </ActionRow>
          ) : null}
        </div>
        <UserAvatar alt={avatarAlt} size={56} src={avatarSrc} />
        <Text component="p" style={profileTitleStyle} w="100%">
          {title}
        </Text>
        <Badge tone={highlighted ? 'accent' : 'neutral'}>{badgeLabel}</Badge>
        {footerAction ? <ActionRow justify="center">{footerAction}</ActionRow> : null}
      </ContentStack>
    </InsetPanel>
  );
}
