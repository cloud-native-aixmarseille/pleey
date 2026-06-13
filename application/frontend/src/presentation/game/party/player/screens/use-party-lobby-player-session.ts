import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { PartyLobbyGateway } from '../../../../../application/game/party/shared/facades/party-lobby.facade';
import type { PartyActionId } from '../../../../../domains/game/party/shared/entities/party-action';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
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
  readonly pendingPlayerActionId: PartyActionId | null;
  readonly playerActionErrorMessage: string | null;
  readonly submitAction: (actionId: PartyActionId) => Promise<void>;
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
  const [pendingPlayerActionId, setPendingPlayerActionId] = useState<PartyActionId | null>(null);
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
      setPendingPlayerActionId(null);
      clearError();
      return;
    }

    if (party.context?.stage?.actionSubmission?.currentPlayer) {
      setPendingPlayerActionId(null);
      clearError();
    }
  }, [
    clearError,
    party?.context?.lifecycle.phase,
    party?.context?.stage?.actionSubmission?.currentPlayer?.selectedActionId,
  ]);

  const submitAction = useEffectEvent(async (actionId: PartyActionId) => {
    if (
      !party ||
      party.context?.stage?.current === undefined ||
      party.context?.stage?.current === null ||
      party.context?.stage?.actionSubmission?.currentPlayer !== null ||
      pendingPlayerActionId !== null
    ) {
      return;
    }

    setPendingPlayerActionId(actionId);
    clearError();

    try {
      await partyLobbyFacade.submitAction({ actionId, partyId: party.partyId });
    } catch (error) {
      setPendingPlayerActionId(null);
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
    pendingPlayerActionId,
    playerActionErrorMessage: feedback.errorMessage,
    submitAction,
  };
}
