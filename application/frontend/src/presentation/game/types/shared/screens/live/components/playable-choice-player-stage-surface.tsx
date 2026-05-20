import { PartyStatus } from '../../../../../../../domains/game/party/shared/entities/party-status';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { ResponsiveGrid } from '../../../../../../shared/ui/layout/containers';
import { PlayerStageSurfaceFrame } from '../../../../../party/player/screens/pin/components/player-stage-surface-frame';
import { resolvePlayableChoiceActionSlotLabel } from './playable-choice-action-slot-identity';
import { PlayableChoiceResultActionTile } from './playable-choice-result-action-tile';
import type { PlayableChoicePlayerStageSurfaceProps } from './playable-choice-runtime-panel.types';
import { StageCountdownTimer } from './stage-countdown-timer';
import {
  resolveStageTotalDurationMs,
  useStageRemainingDurationMs,
} from './use-stage-remaining-duration-ms';

export function PlayableChoicePlayerStageSurface({
  copy,
  onLeaveParty,
  onSubmitAction,
  party,
  pendingActionId,
  playerActionErrorMessage,
  testIdPrefix,
}: PlayableChoicePlayerStageSurfaceProps) {
  const { t } = usePresentationTranslation();
  const currentStage = party.context?.stage?.current;
  const currentPlayerAction = party.context?.stage?.actionSubmission?.currentPlayer ?? null;
  const remainingDurationMs = useStageRemainingDurationMs(party);
  const totalDurationMs = resolveStageTotalDurationMs(party);
  const isStageTimerExpired = remainingDurationMs === 0;

  if (!currentStage) {
    return null;
  }

  const selectedActionId = currentPlayerAction?.selectedActionId ?? pendingActionId;
  const isSubmitting = pendingActionId !== null && currentPlayerAction === null;
  const isLocked = currentPlayerAction !== null;
  const areActionsDisabled =
    party.status !== PartyStatus.ACTIVE || isSubmitting || isLocked || isStageTimerExpired;

  return (
    <PlayerStageSurfaceFrame
      isLocked={isLocked}
      isSubmitting={isSubmitting}
      lockedLabel={t(copy.responseLocked)}
      onLeaveParty={onLeaveParty}
      party={party}
      playerActionErrorMessage={playerActionErrorMessage}
      stageAside={
        <StageCountdownTimer
          isPaused={party.status === PartyStatus.PAUSED}
          remainingDurationMs={remainingDurationMs}
          size="md"
          testId={`${testIdPrefix}-player-stage-timer`}
          totalDurationMs={totalDurationMs}
        />
      }
      submittingLabel={t('game.party.player.route.actionSubmitting')}
      testId={`${testIdPrefix}-player-stage-surface`}
    >
      <ResponsiveGrid columns={{ base: 1, sm: 2 }} gap="md">
        {currentStage.actions.map((action, index) => {
          const isSelected = selectedActionId === action.id;

          return (
            <PlayableChoiceResultActionTile
              key={action.id}
              copy={copy}
              disabled={areActionsDisabled}
              index={index}
              isCorrect={false}
              isSelected={isSelected}
              onClick={() => onSubmitAction(action.id)}
              slotCount={currentStage.actions.length}
              testId={`${testIdPrefix}-player-stage-action-${resolvePlayableChoiceActionSlotLabel(index).toLowerCase()}`}
              text={action.text}
            />
          );
        })}
      </ResponsiveGrid>
    </PlayerStageSurfaceFrame>
  );
}
