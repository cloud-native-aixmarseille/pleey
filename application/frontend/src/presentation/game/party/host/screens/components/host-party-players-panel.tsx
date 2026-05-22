import type { PartyObservationPlayer } from '../../../../../../domains/game/party/shared/entities/party-observation-player';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { PartyLobbyPlayersPanel } from '../../../shared/screens/components/party-lobby-players-panel';

interface HostPartyPlayersPanelProps {
  readonly players: readonly PartyObservationPlayer[];
}

export function HostPartyPlayersPanel({ players }: HostPartyPlayersPanelProps) {
  const { t } = usePresentationTranslation();

  return (
    <PartyLobbyPlayersPanel
      ariaLabel={t('game.party.route.playersLabel')}
      avatarAltLabel={(username) => t('game.party.route.playerAvatarAlt', { username })}
      emptyMessage={t('game.party.route.emptyPlayers')}
      players={players}
      tileBadgeLabel={t('game.party.role.player')}
      title={t('game.party.route.playersTitle')}
      youBadgeLabel={t('game.party.route.youBadge')}
    />
  );
}
