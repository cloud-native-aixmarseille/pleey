import type { PartyObservation } from '../../../../../../domains/game/party/shared/entities/party-observation';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { ContentStack } from '../../../../../shared/ui/layout/containers';
import { SupportingText } from '../../../../../shared/ui/layout/typography';
import { PartyLobbyPlayersPanel } from '../../../shared/screens/components/party-lobby-players-panel';
import { PlayerPartyStatusBar } from './player-party-status-bar';

interface PlayerLobbySurfaceProps {
  readonly onLeaveParty: () => void;
  readonly party: PartyObservation;
}

export function PlayerLobbySurface({ onLeaveParty, party }: PlayerLobbySurfaceProps) {
  const { t } = usePresentationTranslation();

  return (
    <ContentStack gap="lg">
      <PlayerPartyStatusBar onLeaveParty={onLeaveParty} party={party} variant="lobby" />

      <SupportingText size="sm" tone="soft">
        {t('game.party.player.route.scoringExplanation')}
      </SupportingText>

      <PartyLobbyPlayersPanel
        ariaLabel={t('game.party.route.playersLabel')}
        avatarAltLabel={(username) => t('game.party.route.playerAvatarAlt', { username })}
        emptyMessage={t('game.party.route.emptyPlayers')}
        players={party.players}
        tileBadgeLabel={t('game.party.role.player')}
        title={t('game.party.route.playersTitle')}
        youBadgeLabel={t('game.party.route.youBadge')}
      />
    </ContentStack>
  );
}
