import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { PartyLobbyGateway } from '../../../../../application/game/party/shared/facades/party-lobby.facade';
import { PartyJoinReceiptStatus } from '../../../../../domains/game/party/player/ports/party-player.port';
import type { PartyActionId } from '../../../../../domains/game/party/shared/entities/party-action';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import { PartyPlayerIdentityKind } from '../../../../../domains/game/party/shared/entities/party-player-identity';
import { PartyManagementErrorCode } from '../../../../../domains/game/party/shared/errors/party-management-error-code';
import type { GuestId } from '../../../../../domains/identity/entities/guest';

interface UsePartyLobbyPlayerSessionParams {
  readonly clearGuestSessionOnObservedGuestRejoinFailure: boolean;
  readonly currentGuestId: GuestId | null;
  readonly observedGuestRejoinGuestId: GuestId | null;
  readonly observedGuestRejoinUsername: string | undefined;
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
  clearGuestSessionOnObservedGuestRejoinFailure,
  currentGuestId,
  observedGuestRejoinGuestId,
  observedGuestRejoinUsername,
  onPartyLeft,
  party,
  partyLobbyFacade,
  setIsLeaveSubmitting,
  setJoinErrorMessage,
}: UsePartyLobbyPlayerSessionParams): UsePartyLobbyPlayerSessionResult {
  const [pendingPlayerActionId, setPendingPlayerActionId] = useState<PartyActionId | null>(null);
  const [playerActionErrorMessage, setPlayerActionErrorMessage] = useState<string | null>(null);
  const currentPartyPin = party?.pin ?? null;
  const currentPlayer = party?.players.find((player) => player.isCurrentPlayer) ?? null;
  const previousCurrentPlayerRef = useRef(currentPlayer);
  const hasLostCurrentPlayer = previousCurrentPlayerRef.current !== null && currentPlayer === null;

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
      setPlayerActionErrorMessage(null);
      return;
    }

    if (party.context?.stage?.actionSubmission?.currentPlayer) {
      setPendingPlayerActionId(null);
      setPlayerActionErrorMessage(null);
    }
  }, [
    party?.context?.lifecycle.phase,
    party?.context?.lifecycle.stageId,
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
    setPlayerActionErrorMessage(null);

    try {
      await partyLobbyFacade.submitAction({ actionId, partyId: party.partyId });
    } catch (error) {
      setPendingPlayerActionId(null);
      setPlayerActionErrorMessage(
        error instanceof Error ? error.message : PartyManagementErrorCode.OBSERVE_FAILED,
      );
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

  useEffect(() => {
    if (
      hasLostCurrentPlayer ||
      !party ||
      currentPartyPin === null ||
      observedGuestRejoinGuestId === null
    ) {
      return;
    }

    let isCancelled = false;

    void partyLobbyFacade
      .rejoinParty({
        pin: currentPartyPin,
        playerIdentity: {
          kind: PartyPlayerIdentityKind.Guest,
          guestId: observedGuestRejoinGuestId,
        },
        username: observedGuestRejoinUsername,
      })
      .then((receipt) => {
        if (isCancelled) {
          return;
        }

        if (receipt.status === PartyJoinReceiptStatus.ACCEPTED) {
          if (receipt.player.identity.kind === PartyPlayerIdentityKind.Guest) {
            partyLobbyFacade.setGuestId(currentPartyPin, receipt.player.identity.guestId);
          }

          setJoinErrorMessage(null);
          return;
        }

        if (clearGuestSessionOnObservedGuestRejoinFailure) {
          partyLobbyFacade.clearGuestId(currentPartyPin);
        }

        setJoinErrorMessage(receipt.errorMessage);
      });

    return () => {
      isCancelled = true;
    };
  }, [
    clearGuestSessionOnObservedGuestRejoinFailure,
    currentPartyPin,
    hasLostCurrentPlayer,
    observedGuestRejoinGuestId,
    observedGuestRejoinUsername,
    party,
    partyLobbyFacade,
  ]);

  return {
    leaveParty,
    pendingPlayerActionId,
    playerActionErrorMessage,
    submitAction,
  };
}
