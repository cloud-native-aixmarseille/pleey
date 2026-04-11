import { Text } from '@mantine/core';
import { Badge } from '../feedback/badge';
import { uiThemeTokens } from '../foundation/ui-theme';
import { ActionRow, ContentStack } from '../layout/containers';
import { InsetPanel } from '../layout/panels';
import { UserAvatar } from './user-avatar';

interface ProfileTileProps {
  readonly avatarAlt: string;
  readonly avatarSrc?: string | null;
  readonly badgeLabel: string;
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

export function ProfileTile({
  avatarAlt,
  avatarSrc,
  badgeLabel,
  highlighted = false,
  highlightLabel,
  title,
}: ProfileTileProps) {
  return (
    <InsetPanel padding="md" tone={highlighted ? 'accent' : 'default'}>
      <ContentStack align="center" gap="xs">
        {highlightLabel ? (
          <ActionRow justify="center">
            <Badge tone="success">{highlightLabel}</Badge>
          </ActionRow>
        ) : null}
        <UserAvatar alt={avatarAlt} size={56} src={avatarSrc} />
        <Text component="p" style={profileTitleStyle} w="100%">
          {title}
        </Text>
        <Badge tone={highlighted ? 'accent' : 'neutral'}>{badgeLabel}</Badge>
      </ContentStack>
    </InsetPanel>
  );
}
