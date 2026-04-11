import type { PartyObservationPlayer } from '../../../../../../../domains/game/party/shared/entities/party-observation-player';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../../shared/ui/foundation/ui-typography';
import { ContentStack } from '../../../../../../shared/ui/layout/containers';
import { HeroPanel } from '../../../../../../shared/ui/layout/panels';
import {
  heroContentStyle,
  heroIconStyle,
  heroSubtitleStyle,
  heroTitleStyle,
  mobileHeroContentStyle,
  mobileHeroIconStyle,
  mobileHeroSubtitleStyle,
  mobileHeroTitleStyle,
} from './party-final-summary-panel.styles';

interface PartyFinalSummaryHeroProps {
  readonly isMobile: boolean;
  readonly winner: PartyObservationPlayer | null;
}

export function PartyFinalSummaryHero({ isMobile, winner }: PartyFinalSummaryHeroProps) {
  const { t } = usePresentationTranslation();

  return (
    <HeroPanel padding="lg">
      <div style={isMobile ? mobileHeroContentStyle : heroContentStyle}>
        <ContentStack align="center" gap="sm">
          <span aria-hidden="true" style={isMobile ? mobileHeroIconStyle : heroIconStyle}>
            🏆
          </span>
          <span style={{ ...uiTypeScale.overline, color: uiThemeTokens.color.text.soft }}>
            {t('game.party.route.finalSummaryEyebrow')}
          </span>
          <h1 style={isMobile ? mobileHeroTitleStyle : heroTitleStyle}>
            {t('game.party.route.finalSummaryTitle')}
          </h1>
          <p style={isMobile ? mobileHeroSubtitleStyle : heroSubtitleStyle}>
            {winner
              ? t('game.party.route.finalSummarySubtitleWithWinner', {
                  username: winner.username,
                })
              : t('game.party.route.finalSummarySubtitleNoWinner')}
          </p>
        </ContentStack>
      </div>
    </HeroPanel>
  );
}
