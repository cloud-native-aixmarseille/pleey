import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import {
  resultTransitionContentStyle,
  resultTransitionOverlayStyle,
  resultTransitionPulseInnerStyle,
  resultTransitionPulseStyle,
  resultTransitionSubtitleStyle,
  resultTransitionTitleStyle,
  STAGE_RESPONSIVE_CSS,
} from '../stage-styles';

export function StageResultTransition() {
  const { t } = usePresentationTranslation();

  return (
    <div
      style={resultTransitionOverlayStyle}
      aria-live="polite"
      data-testid="stage-result-transition"
    >
      <style>{STAGE_RESPONSIVE_CSS}</style>
      <div style={resultTransitionContentStyle}>
        <div style={resultTransitionPulseStyle} aria-hidden="true">
          <div style={resultTransitionPulseInnerStyle} />
        </div>
        <p style={resultTransitionTitleStyle}>{t('game.stage.timeUpTitle')}</p>
        <p style={resultTransitionSubtitleStyle}>{t('game.stage.timeUpDescription')}</p>
      </div>
    </div>
  );
}
