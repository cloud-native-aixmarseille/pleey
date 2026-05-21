import type { PartyObservationPlayer } from '../../../../../../../domains/game/party/shared/entities/party-observation-player';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../../shared/ui/foundation/ui-typography';
import { ContentStack } from '../../../../../../shared/ui/layout/containers';
import { HeroPanel } from '../../../../../../shared/ui/layout/panels';
import { MotionFadeIn, MotionPop } from '../../../../../../shared/ui/motion/motion-primitives';
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
          <MotionPop>
            <span aria-hidden="true" style={isMobile ? mobileHeroIconStyle : heroIconStyle}>
              🏆
            </span>
          </MotionPop>
          <MotionFadeIn delay={0.05}>
            <span style={{ ...uiTypeScale.overline, color: uiThemeTokens.color.text.soft }}>
              {t('game.party.route.finalSummaryEyebrow')}
            </span>
          </MotionFadeIn>
          <MotionFadeIn delay={0.12}>
            <h1 style={isMobile ? mobileHeroTitleStyle : heroTitleStyle}>
              {t('game.party.route.finalSummaryTitle')}
            </h1>
          </MotionFadeIn>
          <MotionFadeIn delay={0.2}>
            <p style={isMobile ? mobileHeroSubtitleStyle : heroSubtitleStyle}>
              {winner
                ? t('game.party.route.finalSummarySubtitleWithWinner', {
                    username: winner.username,
                  })
                : t('game.party.route.finalSummarySubtitleNoWinner')}
            </p>
          </MotionFadeIn>
        </ContentStack>
      </div>
    </HeroPanel>
  );
}
