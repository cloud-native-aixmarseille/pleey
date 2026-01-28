import type { HostResultViewProps } from '../../../../../application/game-catalog/contracts/live-game-type-facade';
import { ResultRevealAnimation } from '../../../../game-session/live/shared/animations/result-reveal-animation';
import { createDistributionFillStyle } from '../../../../game-session/live/shared/screens/stage/action-slot-styles';
import {
  createDistributionBarStyle,
  distributionCountStyle,
  distributionPercentStyle,
  distributionTextStyle,
  hostQuestionStyle,
  resultStageContainerStyle,
  STAGE_RESPONSIVE_CSS,
} from '../../../../game-session/live/shared/screens/stage/stage-styles';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { createBadgeStyle } from '../../../../shared/ui/foundation/ui-theme';

export function QuizHostResultView({
  stage,
  actionResult,
  resultDistribution,
}: HostResultViewProps) {
  const { t } = usePresentationTranslation();

  return (
    <ResultRevealAnimation>
      <div style={resultStageContainerStyle} data-testid="quiz-host-result-layout">
        <style>{STAGE_RESPONSIVE_CSS}</style>

        <ResultRevealAnimation.Banner>
          <h1
            style={{ ...hostQuestionStyle, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}
            data-host-question
          >
            {stage.text}
          </h1>
        </ResultRevealAnimation.Banner>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {resultDistribution.map((item, index) => (
            <ResultRevealAnimation.Bar key={item.id}>
              <div style={createDistributionBarStyle(index, item.actionPercent, item.isCorrect)}>
                <div
                  style={createDistributionFillStyle(
                    index,
                    resultDistribution.length,
                    item.actionPercent,
                  )}
                />
                <span style={distributionTextStyle}>
                  {item.text}
                  {item.isCorrect ? (
                    <span style={{ ...createBadgeStyle('success'), marginLeft: '0.5rem' }}>
                      {t('quiz.runtime.correctBadge')}
                    </span>
                  ) : null}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  <span style={distributionPercentStyle}>{item.actionPercent}%</span>
                  <span style={distributionCountStyle}>
                    ({t('quiz.runtime.voteCount', { count: String(item.actionCount) })})
                  </span>
                </div>
              </div>
            </ResultRevealAnimation.Bar>
          ))}
        </div>
      </div>
    </ResultRevealAnimation>
  );
}
