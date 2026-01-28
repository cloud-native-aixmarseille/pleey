import { motion } from 'framer-motion';
import type { HostStageViewProps } from '../../../../../application/game-catalog/contracts/live-game-type-facade';
import {
  createHostActionCardStyle,
  hostActionLabelStyle,
} from '../../../../game-session/live/shared/screens/stage/action-slot-styles';
import {
  actionGridStyle,
  hostQuestionStyle,
  hostStageContainerStyle,
  pauseLabelStyle,
  pauseOverlayStyle,
  STAGE_RESPONSIVE_CSS,
} from '../../../../game-session/live/shared/screens/stage/stage-styles';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';

const cardVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 16 },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 22,
      delay: 0.3 + index * 0.08,
    },
  }),
};

export function PredictionHostStageView({ stage, resolvedActions, isPaused }: HostStageViewProps) {
  const { t } = usePresentationTranslation();

  return (
    <div style={{ ...hostStageContainerStyle, position: 'relative' }}>
      <style>{STAGE_RESPONSIVE_CSS}</style>

      <h1 style={hostQuestionStyle} data-host-question>
        {stage.text}
      </h1>

      <div style={actionGridStyle} data-stage-action-grid>
        {resolvedActions.map((action, index) => (
          <motion.div
            key={action.id}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            style={createHostActionCardStyle(index, resolvedActions.length)}
          >
            <p style={hostActionLabelStyle}>{action.text}</p>
          </motion.div>
        ))}
      </div>

      {isPaused ? (
        <div style={pauseOverlayStyle}>
          <span style={pauseLabelStyle}>{t('prediction.runtime.paused')}</span>
        </div>
      ) : null}
    </div>
  );
}
