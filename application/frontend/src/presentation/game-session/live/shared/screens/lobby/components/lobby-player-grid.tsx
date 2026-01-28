import { Group, Paper, SimpleGrid, Text } from '@mantine/core';
import type { GameSessionPlayer } from '../../../../../../../domains/game-session/entities/game-session-player';
import type { HighlightedPlayersResult } from '../../../../../../../domains/game-session/entities/lobby-result';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { UserAvatar } from '../../../../../../shared/ui/data/user-avatar';
import { Badge } from '../../../../../../shared/ui/feedback/badge';
import { StatusBanner } from '../../../../../../shared/ui/feedback/status-banner';
import { surfaceRecipes } from '../../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../../shared/ui/foundation/ui-typography';

interface LobbyPlayerGridProps {
  readonly highlightedPlayers: HighlightedPlayersResult;
  readonly playerCount: number;
}

const panelStyle = {
  ...surfaceRecipes.elevated,
  padding: uiThemeTokens.spacing.xl,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
} as const;

const headerStyle = {
  marginBottom: uiThemeTokens.spacing.lg,
} as const;

const titleStyle = {
  ...uiTypeScale.sectionTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
} as const;

const countStyle = {
  ...uiTypeScale.metric,
  color: uiThemeTokens.color.brand.accent,
  margin: 0,
} as const;

const playerCardStyle = {
  alignItems: 'center',
  background: uiThemeTokens.color.surface.recessed,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.inset,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xs,
  padding: uiThemeTokens.spacing.md,
  textAlign: 'center',
} as const;

const currentPlayerCardStyle = {
  ...playerCardStyle,
  background: uiThemeTokens.color.surface.accentMuted,
  border: `2px solid ${uiThemeTokens.color.border.accent}`,
  boxShadow: uiThemeTokens.shadow.accentGlow,
} as const;

const avatarStyle = {
  borderRadius: '50%',
  border: `2px solid ${uiThemeTokens.color.border.subtle}`,
  height: 56,
  objectFit: 'cover',
  width: 56,
} as const;

const currentAvatarStyle = {
  ...avatarStyle,
  border: `2px solid ${uiThemeTokens.color.border.accent}`,
  boxShadow: uiThemeTokens.shadow.accentGlow,
} as const;

const nameStyle = {
  ...uiTypeScale.cardTitle,
  color: uiThemeTokens.color.text.primary,
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '100%',
} as const;

const currentPlayerBadgeRowStyle = {
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
} as const;

const gridContainerStyle = {
  flex: 1,
  overflowY: 'auto',
} as const;

function PlayerTile({
  player,
  isCurrentPlayer,
}: {
  readonly player: GameSessionPlayer;
  readonly isCurrentPlayer: boolean;
}) {
  const { t } = usePresentationTranslation();

  return (
    <Paper style={isCurrentPlayer ? currentPlayerCardStyle : playerCardStyle}>
      {isCurrentPlayer ? (
        <div style={currentPlayerBadgeRowStyle}>
          <Badge tone="success">{t('game.lobby.youBadge')}</Badge>
        </div>
      ) : null}
      <UserAvatar
        alt={`${player.username} avatar`}
        size={56}
        src={player.avatarUri}
        style={isCurrentPlayer ? currentAvatarStyle : avatarStyle}
      />
      <Text component="p" style={nameStyle}>
        {player.username}
      </Text>
    </Paper>
  );
}

export function LobbyPlayerGrid({ highlightedPlayers, playerCount }: LobbyPlayerGridProps) {
  const { t } = usePresentationTranslation();
  const allPlayers = [
    ...(highlightedPlayers.currentPlayer ? [highlightedPlayers.currentPlayer] : []),
    ...highlightedPlayers.otherPlayers,
  ];

  return (
    <Paper component="section" style={panelStyle} aria-label={t('game.lobby.playerGridLabel')}>
      <Group align="baseline" justify="space-between" wrap="wrap" style={headerStyle}>
        <Text component="h3" style={titleStyle}>
          {t('game.lobby.playersTitle')}
        </Text>
        <Text component="p" style={countStyle}>
          {playerCount}
        </Text>
      </Group>

      <div style={gridContainerStyle}>
        {allPlayers.length > 0 ? (
          <SimpleGrid cols={{ base: 2, sm: 3, md: 2, lg: 3 }} spacing="md">
            {highlightedPlayers.currentPlayer ? (
              <PlayerTile
                key="current-player"
                player={highlightedPlayers.currentPlayer}
                isCurrentPlayer
              />
            ) : null}
            {highlightedPlayers.otherPlayers.map((player) => (
              <PlayerTile
                key={`${player.id ?? player.guestId ?? player.username}`}
                player={player}
                isCurrentPlayer={false}
              />
            ))}
          </SimpleGrid>
        ) : (
          <StatusBanner tone="info">{t('game.lobby.emptyRoster')}</StatusBanner>
        )}
      </div>
    </Paper>
  );
}
