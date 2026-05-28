import type { PartyObservationPlayer } from '../../../../../../domains/game/party/shared/entities/party-observation-player';
import { PartyPlayerIdentityKind } from '../../../../../../domains/game/party/shared/entities/party-player-identity';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { PartyLobbyPlayersPanel } from '../../../shared/screens/components/party-lobby-players-panel';

interface HostPartyPlayersPanelProps {
  readonly onKickPlayer: (player: PartyObservationPlayer) => void;
  readonly pendingKickedPlayerKey: string | null;
  readonly players: readonly PartyObservationPlayer[];
}

function toPlayerKey(player: PartyObservationPlayer): string {
  return player.identity.kind === PartyPlayerIdentityKind.User
    ? `user:${player.identity.userId}`
    : `guest:${player.identity.guestId}`;
}

export function HostPartyPlayersPanel({
  onKickPlayer,
  pendingKickedPlayerKey,
  players,
}: HostPartyPlayersPanelProps) {
  const { t } = usePresentationTranslation();

  return (
    <PartyLobbyPlayersPanel
      ariaLabel={t('game.party.route.playersLabel')}
      avatarAltLabel={(username) => t('game.party.route.playerAvatarAlt', { username })}
      emptyMessage={t('game.party.route.emptyPlayers')}
      players={players}
      renderPlayerAction={(player) => {
        const playerKey = toPlayerKey(player);

        return (
          <Button
            aria-label={t('game.party.host.route.kickPlayerAriaLabel', {
              username: player.username,
            })}
            disabled={pendingKickedPlayerKey !== null}
            intent="ghost"
            leftSection={<AppIcon aria-hidden name="trash" size={16} />}
            onClick={() => onKickPlayer(player)}
            size="sm"
          >
            {pendingKickedPlayerKey === playerKey
              ? t('game.party.host.route.kickPlayerPending')
              : t('game.party.host.route.kickPlayerCta')}
          </Button>
        );
      }}
      tileBadgeLabel={t('game.party.role.player')}
      title={t('game.party.route.playersTitle')}
      youBadgeLabel={t('game.party.route.youBadge')}
    />
  );
}
