import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { PartyLobbyGateway } from '../../../../../application/game/party/shared/facades/party-lobby.facade';
import type { PartyActionId } from '../../../../../domains/game/party/shared/entities/party-action';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import { PartyStatus } from '../../../../../domains/game/party/shared/entities/party-status';
import { PartyManagementErrorCode } from '../../../../../domains/game/party/shared/errors/party-management-error-code';
import type { GuestId } from '../../../../../domains/identity/entities/guest';
import { usePresentationFeedbackChannel } from '../../../../shared/ui/feedback/use-presentation-feedback-channel';

interface UsePartyLobbyPlayerSessionParams {
  readonly currentGuestId: GuestId | null;
  readonly onPartyLeft: () => void;
  readonly party: PartyObservation | undefined;
  readonly partyLobbyFacade: PartyLobbyGateway;
  readonly setIsLeaveSubmitting: (value: boolean) => void;
  readonly setJoinErrorMessage: (value: string | null) => void;
}

interface UsePartyLobbyPlayerSessionResult {
  readonly leaveParty: () => Promise<void>;
  readonly pendingPlayerActionIds: readonly PartyActionId[] | null;
  readonly playerActionErrorMessage: string | null;
  readonly submitAction: (actionIds: readonly PartyActionId[]) => Promise<void>;
}

export function usePartyLobbyPlayerSession({
  currentGuestId,
  onPartyLeft,
  party,
  partyLobbyFacade,
  setIsLeaveSubmitting,
  setJoinErrorMessage,
}: UsePartyLobbyPlayerSessionParams): UsePartyLobbyPlayerSessionResult {
  const feedback = usePresentationFeedbackChannel();
  const clearError = feedback.clearError;
  const [pendingPlayerActionIds, setPendingPlayerActionIds] = useState<readonly PartyActionId[] | null>(null);
  const currentPartyPin = party?.pin ?? null;
  const currentPlayer = party?.players.find((player) => player.isCurrentPlayer) ?? null;
  const previousCurrentPlayerRef = useRef(currentPlayer);

  const leaveParty = useEffectEvent(async () => {
    if (currentPlayer === null) {
      return;
    }

    setIsLeaveSubmitting(true);

    const hasLeft = await partyLobbyFacade.leaveParty();

    if (!hasLeft) {
      setIsLeaveSubmitting(false);
      setJoinErrorMessage(PartyManagementErrorCode.LEAVE_FAILED);
      return;
    }

    if (currentGuestId !== null && currentPartyPin !== null) {
      partyLobbyFacade.clearGuestId(currentPartyPin);
    }

    setJoinErrorMessage(null);
    onPartyLeft();
  });

  useEffect(() => {
    if (party?.context?.lifecycle.phase !== 'stage') {
      setPendingPlayerActionIds(null);
      clearError();
      return;
    }

    const currentPlayerAction = party.context?.stage?.actionSubmission?.currentPlayer;
    const currentActionIds =
      currentPlayerAction?.selectedActionIds ?? (currentPlayerAction ? [currentPlayerAction.selectedActionId] : []);

    if (
      pendingPlayerActionIds !== null &&
      pendingPlayerActionIds.length === currentActionIds.length &&
      pendingPlayerActionIds.every((actionId) => currentActionIds.includes(actionId))
    ) {
      setPendingPlayerActionIds(null);
      clearError();
    }
  }, [
    clearError,
    pendingPlayerActionIds,
    party?.context?.lifecycle.phase,
    party?.context?.stage?.actionSubmission?.currentPlayer,
  ]);

  const submitAction = useEffectEvent(async (actionIds: readonly PartyActionId[]) => {
    if (
      !party ||
      party.status !== PartyStatus.ACTIVE ||
      party.context?.stage?.current === undefined ||
      party.context?.stage?.current === null ||
      pendingPlayerActionIds !== null ||
      actionIds.length === 0
    ) {
      return;
    }

    const currentPlayerAction = party.context.stage.actionSubmission.currentPlayer;
    const currentActionIds =
      currentPlayerAction?.selectedActionIds ?? (currentPlayerAction ? [currentPlayerAction.selectedActionId] : []);
    const stageEndsAtEpochMs = party.context.lifecycle.stageEndsAtEpochMs;
    const isSameSelection =
      currentActionIds.length === actionIds.length &&
      actionIds.every((actionId) => currentActionIds.includes(actionId));

    if (
      (currentPlayerAction !== null && (!party.settings.allowOptionChangeAfterVoting || isSameSelection)) ||
      (stageEndsAtEpochMs !== null && stageEndsAtEpochMs <= Date.now())
    ) {
      return;
    }

    setPendingPlayerActionIds(actionIds);
    clearError();

    try {
      await partyLobbyFacade.submitAction({ actionIds, partyId: party.partyId });
    } catch (error) {
      setPendingPlayerActionIds(null);
      feedback.handleError(error, {
        fallbackMessage: PartyManagementErrorCode.OBSERVE_FAILED,
        id: 'party-player-submit-action-error-toast',
        notify: true,
      });
    }
  });

  useEffect(() => {
    const previousCurrentPlayer = previousCurrentPlayerRef.current;

    if (
      previousCurrentPlayer !== null &&
      currentPlayer === null &&
      currentGuestId !== null &&
      currentPartyPin !== null
    ) {
      partyLobbyFacade.clearGuestId(currentPartyPin);
    }

    previousCurrentPlayerRef.current = currentPlayer;
  }, [currentGuestId, currentPartyPin, currentPlayer, partyLobbyFacade]);

  return {
    leaveParty,
    pendingPlayerActionIds,
    playerActionErrorMessage: feedback.errorMessage,
    submitAction,
  };
}
