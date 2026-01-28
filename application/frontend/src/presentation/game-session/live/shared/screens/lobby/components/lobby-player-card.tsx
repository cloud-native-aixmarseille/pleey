import { Group, Paper, Stack, Text } from '@mantine/core';
import { Badge } from '../../../../../../shared/ui/feedback/badge';
import {
  lobbyPlayerCardStyle,
  uiThemeTokens,
} from '../../../../../../shared/ui/foundation/ui-theme';
import { Heading, SupportingText } from '../../../../../../shared/ui/layout/typography';

interface LobbyPlayerCardProps {
  readonly avatarUri: string;
  readonly caption: string;
  readonly isCurrentPlayer?: boolean;
  readonly name: string;
  readonly statusLabel: string;
}

const cardStyle = {
  ...lobbyPlayerCardStyle,
  borderRadius: uiThemeTokens.radius.inset,
  padding: uiThemeTokens.spacing.md,
} as const;

const currentPlayerCardStyle = {
  ...cardStyle,
  background: uiThemeTokens.color.surface.accentMuted,
  border: `1px solid ${uiThemeTokens.color.border.accent}`,
} as const;

const playerGroupStyle = {
  alignItems: 'center',
  gap: uiThemeTokens.spacing.sm,
  minWidth: 0,
} as const;

const avatarStyle = {
  borderRadius: '50%',
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  flexShrink: 0,
  height: 42,
  objectFit: 'cover',
  width: 42,
} as const;

const infoStyle = {
  gap: 2,
  minWidth: 0,
} as const;

export function LobbyPlayerCard({
  avatarUri,
  caption,
  isCurrentPlayer = false,
  name,
  statusLabel,
}: LobbyPlayerCardProps) {
  return (
    <Paper style={isCurrentPlayer ? currentPlayerCardStyle : cardStyle}>
      <Group align="center" justify="space-between" wrap="nowrap">
        <Group style={playerGroupStyle} wrap="nowrap">
          <img alt={`${name} avatar`} role="img" src={avatarUri} style={avatarStyle} />
          <Stack style={infoStyle} gap={2}>
            <SupportingText tone="soft">{caption}</SupportingText>
            <Heading level={3}>{name}</Heading>
          </Stack>
        </Group>

        <Stack align="flex-end" gap={6}>
          <Badge tone={isCurrentPlayer ? 'accent' : 'neutral'}>{caption}</Badge>
          <Text c={uiThemeTokens.color.text.soft} size="xs">
            {statusLabel}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}
