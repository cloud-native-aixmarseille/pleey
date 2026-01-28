import type { PlayerResultViewProps } from '../../../../../application/game-catalog/contracts/live-game-type-facade';
import { ResultRevealAnimation } from '../../../../game-session/live/shared/animations/result-reveal-animation';
import { createDistributionFillStyle } from '../../../../game-session/live/shared/screens/stage/action-slot-styles';
import {
  createDistributionBarStyle,
  distributionPercentStyle,
  distributionTextStyle,
  resultBannerCorrectStyle,
  resultBannerIncorrectStyle,
  resultLabelStyle,
  resultPointsStyle,
  resultSublabelStyle,
} from '../../../../game-session/live/shared/screens/stage/stage-styles';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { createBadgeStyle } from '../../../../shared/ui/foundation/ui-theme';

export function PredictionPlayerResultView({
  actionResult,
  resultDistribution,
}: PlayerResultViewProps) {
  const { t } = usePresentationTranslation();
  const bannerStyle = actionResult.isCorrect
    ? resultBannerCorrectStyle
    : resultBannerIncorrectStyle;

  return (
    <ResultRevealAnimation>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <ResultRevealAnimation.Banner>
          <div style={bannerStyle}>
            {actionResult.isCorrect ? (
              <>
                <ResultRevealAnimation.Score>
                  <p style={resultPointsStyle}>+{actionResult.points}</p>
                </ResultRevealAnimation.Score>
                <p style={resultLabelStyle}>{t('prediction.runtime.resultCorrect')}</p>
              </>
            ) : (
              <>
                <p style={resultLabelStyle}>{t('prediction.runtime.resultIncorrect')}</p>
                <p style={resultSublabelStyle}>{t('prediction.runtime.resultIncorrectHint')}</p>
              </>
            )}
          </div>
        </ResultRevealAnimation.Banner>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
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
                      {t('prediction.runtime.correctBadge')}
                    </span>
                  ) : null}
                  {item.isSelected ? (
                    <span style={{ ...createBadgeStyle('accent'), marginLeft: '0.5rem' }}>
                      {t('prediction.runtime.yourPickBadge')}
                    </span>
                  ) : null}
                </span>
                <span style={distributionPercentStyle}>{item.actionPercent}%</span>
              </div>
            </ResultRevealAnimation.Bar>
          ))}
        </div>
      </div>
    </ResultRevealAnimation>
  );
}
