import { motion } from 'framer-motion';
import type { PlayerStageViewProps } from '../../../../../application/game-catalog/contracts/live-game-type-facade';
import { createPlayerActionButtonStyle } from '../../../../game-session/live/shared/screens/stage/action-slot-styles';
import {
  actionGridStyle,
  playerQuestionStyle,
  playerStageContainerStyle,
  STAGE_RESPONSIVE_CSS,
} from '../../../../game-session/live/shared/screens/stage/stage-styles';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { StatusBanner } from '../../../../shared/ui/feedback/status-banner';

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 22,
      delay: 0.25 + index * 0.07,
    },
  }),
};

export function QuizPlayerStageView({
  stage,
  resolvedActions,
  actionSubmitted,
  isPaused,
  timeLeft,
  onSubmitAction,
}: PlayerStageViewProps) {
  const { t } = usePresentationTranslation();
  const isDisabled = actionSubmitted || isPaused || (timeLeft ?? 0) <= 0;

  return (
    <div
      style={playerStageContainerStyle}
      data-testid="quiz-player-stage-layout"
      data-stage-fill-layout
    >
      <style>{STAGE_RESPONSIVE_CSS}</style>

      <p style={playerQuestionStyle}>{stage.text}</p>

      <div style={actionGridStyle} data-stage-action-grid data-stage-fill-grid>
        {resolvedActions.map((action, index) => (
          <motion.button
            key={action.id}
            type="button"
            custom={index}
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            disabled={isDisabled}
            style={createPlayerActionButtonStyle(
              index,
              resolvedActions.length,
              action.isSelected,
              isDisabled,
            )}
            onClick={() => onSubmitAction(action.id)}
            whileTap={isDisabled ? undefined : { scale: 0.95 }}
          >
            {action.text}
          </motion.button>
        ))}
      </div>

      {actionSubmitted ? (
        <StatusBanner tone="success">{t('quiz.runtime.responseLocked')}</StatusBanner>
      ) : null}
    </div>
  );
}
