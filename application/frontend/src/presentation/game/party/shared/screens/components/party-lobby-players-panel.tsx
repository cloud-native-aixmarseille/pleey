import type { PartyObservationPlayer } from '../../../../../../domains/game/party/shared/entities/party-observation-player';
import { PartyPlayerIdentityKind } from '../../../../../../domains/game/party/shared/entities/party-player-identity';
import { ProfileTile } from '../../../../../shared/ui/data/profile-tile';
import { Badge } from '../../../../../shared/ui/feedback/badge';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import {
  AutoFillGrid,
  ContentStack,
  SplitWrapRow,
} from '../../../../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../../../../shared/ui/layout/panels';
import { Heading } from '../../../../../shared/ui/layout/typography';
import {
  MotionListItem,
  MotionListPresence,
} from '../../../../../shared/ui/motion/motion-primitives';

interface PartyLobbyPlayersPanelProps {
  readonly ariaLabel: string;
  readonly avatarAltLabel: (username: string) => string;
  readonly emptyMessage: string;
  readonly players: readonly PartyObservationPlayer[];
  readonly tileBadgeLabel: string;
  readonly title: string;
  readonly youBadgeLabel: string;
}

interface PlayerTileProps {
  readonly avatarAltLabel: (username: string) => string;
  readonly isCurrent: boolean;
  readonly player: PartyObservationPlayer;
  readonly tileBadgeLabel: string;
  readonly youBadgeLabel: string;
}

function PlayerTile({
  avatarAltLabel,
  isCurrent,
  player,
  tileBadgeLabel,
  youBadgeLabel,
}: PlayerTileProps) {
  return (
    <ProfileTile
      avatarAlt={avatarAltLabel(player.username)}
      avatarSrc={player.avatarUri}
      badgeLabel={tileBadgeLabel}
      highlighted={isCurrent}
      highlightLabel={isCurrent ? youBadgeLabel : undefined}
      title={player.username}
    />
  );
}

function sortPlayers(players: readonly PartyObservationPlayer[]): PartyObservationPlayer[] {
  const current = players.find((player) => player.isCurrentPlayer);
  if (!current) {
    return [...players];
  }

  return [current, ...players.filter((player) => !player.isCurrentPlayer)];
}

function toPlayerKey(player: PartyObservationPlayer): string {
  return player.identity.kind === PartyPlayerIdentityKind.User
    ? `user:${player.identity.userId}`
    : `guest:${player.identity.guestId}`;
}

export function PartyLobbyPlayersPanel({
  ariaLabel,
  avatarAltLabel,
  emptyMessage,
  players,
  tileBadgeLabel,
  title,
  youBadgeLabel,
}: PartyLobbyPlayersPanelProps) {
  const ordered = sortPlayers(players);

  return (
    <section aria-label={ariaLabel}>
      <ElevatedPanel padding="lg">
        <ContentStack gap="lg">
          <SplitWrapRow align="baseline" gap="md">
            <Heading level={3}>{title}</Heading>
            <Badge tone="accent">{players.length}</Badge>
          </SplitWrapRow>

          {ordered.length === 0 && <StatusBanner tone="info">{emptyMessage}</StatusBanner>}
          <AutoFillGrid minItemWidth="8.5rem">
            <MotionListPresence>
              {ordered.map((player) => (
                <MotionListItem key={toPlayerKey(player)}>
                  <PlayerTile
                    avatarAltLabel={avatarAltLabel}
                    isCurrent={player.isCurrentPlayer}
                    player={player}
                    tileBadgeLabel={tileBadgeLabel}
                    youBadgeLabel={youBadgeLabel}
                  />
                </MotionListItem>
              ))}
            </MotionListPresence>
          </AutoFillGrid>
        </ContentStack>
      </ElevatedPanel>
    </section>
  );
}
