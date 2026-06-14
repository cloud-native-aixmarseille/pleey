import type { PartyActionId } from '../../../../../../domains/game/party/shared/entities/party-action';
import type { PartyObservation } from '../../../../../../domains/game/party/shared/entities/party-observation';
import { PartyStatus } from '../../../../../../domains/game/party/shared/entities/party-status';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import {
  MotionStagger,
  MotionStaggerItem,
} from '../../../../../shared/ui/motion/motion-primitives';
import { PlayerStageSurfaceFrame } from './player-stage-surface-frame';

interface PlayerStageSurfaceProps {
  readonly onLeaveParty: () => void;
  readonly onSubmitAction: (actionId: PartyActionId) => void;
  readonly party: PartyObservation;
  readonly pendingActionId: PartyActionId | null;
  readonly playerActionErrorMessage: string | null;
}

const actionGridStyle = {
  display: 'grid',
  gap: '0.75rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
};

export function PlayerStageSurface({
  onLeaveParty,
  onSubmitAction,
  party,
  pendingActionId,
  playerActionErrorMessage,
}: PlayerStageSurfaceProps) {
  const { t } = usePresentationTranslation();
  const currentStage = party.context?.stage?.current;
  const currentPlayerAction = party.context?.stage?.actionSubmission?.currentPlayer ?? null;

  if (!currentStage) {
    return null;
  }

  const selectedActionId = currentPlayerAction?.selectedActionId ?? pendingActionId;
  const isSubmitting = pendingActionId !== null && currentPlayerAction === null;
  const isLocked = currentPlayerAction !== null;
  const areActionsDisabled = party.status !== PartyStatus.ACTIVE || isSubmitting || isLocked;

  return (
    <PlayerStageSurfaceFrame
      contentGap="sm"
      isLocked={isLocked}
      isSubmitting={isSubmitting}
      lockedLabel={t('game.party.player.route.actionLocked')}
      onLeaveParty={onLeaveParty}
      party={party}
      playerActionErrorMessage={playerActionErrorMessage}
      submittingLabel={t('game.party.player.route.actionSubmitting')}
      testId="player-live-stage-surface"
    >
      <MotionStagger style={actionGridStyle}>
        {currentStage.actions.map((action) => {
          const isSelected = selectedActionId === action.id;

          return (
            <MotionStaggerItem key={action.id}>
              <Button
                intent={isSelected ? 'primary' : 'secondary'}
                onClick={() => onSubmitAction(action.id)}
                disabled={areActionsDisabled}
                width="wide"
              >
                {action.text}
              </Button>
            </MotionStaggerItem>
          );
        })}
      </MotionStagger>
    </PlayerStageSurfaceFrame>
  );
}
