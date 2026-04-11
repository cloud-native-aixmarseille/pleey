import type { PartyObservationPlayer } from '../../../../../../../domains/game/party/shared/entities/party-observation-player';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { ContentStack } from '../../../../../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../../../../../shared/ui/layout/panels';
import { SupportingText } from '../../../../../../shared/ui/layout/typography';
import { usePresentationMediaQuery } from '../../../../../../shared/ui/layout/use-presentation-media-query';
import { PartyFinalSummaryHero } from './party-final-summary-hero';
import { createPartyFinalSummaryModel } from './party-final-summary-panel.model';
import { PartyFinalSummaryPodium } from './party-final-summary-podium';
import { PartyFinalSummaryStandings } from './party-final-summary-standings';

interface PartyFinalSummaryPanelProps {
  readonly players: readonly PartyObservationPlayer[];
}

export function PartyFinalSummaryPanel({ players }: PartyFinalSummaryPanelProps) {
  const { t } = usePresentationTranslation();
  const isMobile = usePresentationMediaQuery('(max-width: 48em)');
  const { podiumByRank, rankedPlayers, winner } = createPartyFinalSummaryModel(players);

  return (
    <section
      aria-label={t('game.party.route.finalSummaryLabel')}
      data-testid="party-final-summary-panel"
    >
      <ContentStack gap="lg">
        <PartyFinalSummaryHero isMobile={isMobile} winner={winner} />

        {rankedPlayers.length === 0 ? (
          <ElevatedPanel padding={isMobile ? 'md' : 'lg'}>
            <SupportingText>{t('game.party.route.finalLeaderboardEmpty')}</SupportingText>
          </ElevatedPanel>
        ) : (
          <>
            <PartyFinalSummaryPodium
              isMobile={isMobile}
              podiumByRank={podiumByRank}
              winner={winner}
            />
            <PartyFinalSummaryStandings isMobile={isMobile} players={rankedPlayers} />
          </>
        )}
      </ContentStack>
    </section>
  );
}
