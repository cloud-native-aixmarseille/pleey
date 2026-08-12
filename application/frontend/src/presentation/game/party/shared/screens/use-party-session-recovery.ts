import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { PartyLobbyGateway } from '../../../../../application/game/party/shared/facades/party-lobby.facade';
import { PartyJoinReceiptStatus } from '../../../../../domains/game/party/player/ports/party-player.port';
import type { PartyId, PartyPin } from '../../../../../domains/game/party/shared/entities/party';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import type { PartyJoiningPlayerIdentity } from '../../../../../domains/game/party/shared/entities/party-player-identity';
import { PartyPlayerIdentityKind } from '../../../../../domains/game/party/shared/entities/party-player-identity';
import type { PartyObservationConnectionState } from '../../../../../domains/game/party/shared/ports/party-observation.port';
import type { GuestId } from '../../../../../domains/identity/entities/guest';
import type { UserId } from '../../../../../domains/identity/entities/user';

type PartyObservationPlayer = PartyObservation['players'][number];

const sessionRecoverySignalWindowMs = 15_000;

interface UsePartySessionRecoveryParams {
  readonly connectionState: PartyObservationConnectionState | null;
  readonly currentGuestId: GuestId | null;
  readonly currentPartyPin: PartyPin | null;
  readonly currentPlayer: PartyObservationPlayer | null;
  readonly hasObservedCurrentPlayer: boolean;
  readonly isCurrentUserHost: boolean;
  readonly joinedPartyId: PartyId | null;
  readonly party: PartyObservation | undefined;
  readonly partyLobbyFacade: PartyLobbyGateway;
  readonly setJoinErrorMessage: (value: string | null) => void;
  readonly setJoinedPartyId: (partyId: PartyId | null) => void;
  readonly userId: UserId | null;
}

export function usePartySessionRecovery({
  connectionState,
  currentGuestId,
  currentPartyPin,
  currentPlayer,
  hasObservedCurrentPlayer,
  isCurrentUserHost,
  joinedPartyId,
  party,
  partyLobbyFacade,
  setJoinErrorMessage,
  setJoinedPartyId,
  userId,
}: UsePartySessionRecoveryParams): { readonly shouldPreserveJoinedPartyId: boolean } {
  const lifecycleRecoveryEpoch = usePartySessionRecoveryEpoch();
  const hasRecoverableObservedIdentity = hasPartyIdentityMatch({
    currentGuestId,
    party,
    userId,
  });
  const shouldPreserveJoinedPartyId = shouldRecoverPartySession({
    connectionState,
    currentGuestId,
    currentPartyPin,
    currentPlayer,
    hasObservedCurrentPlayer,
    hasRecoverableObservedIdentity,
    isCurrentUserHost,
    joinedPartyId,
    lifecycleRecoveryEpoch,
    userId,
  });
  const lastAttemptKeyRef = useRef<string | null>(null);
  const tryRecoverPartySession = useEffectEvent(async (attemptKey: string) => {
    if (currentPartyPin === null) {
      return;
    }

    const playerIdentity: PartyJoiningPlayerIdentity | null =
      userId !== null
        ? { kind: PartyPlayerIdentityKind.User, userId }
        : currentGuestId !== null
          ? { kind: PartyPlayerIdentityKind.Guest, guestId: currentGuestId }
          : null;

    if (playerIdentity === null) {
      return;
    }

    try {
      const receipt = await partyLobbyFacade.rejoinParty({
        pin: currentPartyPin,
        playerIdentity,
        username: undefined,
      });

      if (receipt.status !== PartyJoinReceiptStatus.ACCEPTED) {
        if (currentGuestId !== null) {
          partyLobbyFacade.clearGuestId(currentPartyPin);
        }

        if (lastAttemptKeyRef.current === attemptKey) {
          setJoinedPartyId(null);
        }

        return;
      }

      if (receipt.player.identity.kind === PartyPlayerIdentityKind.Guest) {
        partyLobbyFacade.setGuestId(currentPartyPin, receipt.player.identity.guestId);
      }

      if (receipt.player.identity.kind === PartyPlayerIdentityKind.User && currentGuestId !== null) {
        partyLobbyFacade.clearGuestId(currentPartyPin);
      }

      setJoinedPartyId(receipt.partyId);
      setJoinErrorMessage(null);
    } catch {
      // Keep the current observation state until the next reconnect or resume signal.
    }
  });

  useEffect(() => {
    const shouldAttempt = shouldRecoverPartySession({
      connectionState,
      currentGuestId,
      currentPartyPin,
      currentPlayer,
      hasObservedCurrentPlayer,
      hasRecoverableObservedIdentity,
      isCurrentUserHost,
      joinedPartyId,
      lifecycleRecoveryEpoch,
      userId,
    });

    if (!shouldAttempt) {
      return;
    }

    const identityKey = userId !== null ? `user:${userId}` : currentGuestId !== null ? `guest:${currentGuestId}` : null;

    if (currentPartyPin === null || identityKey === null) {
      return;
    }

    const attemptKey = [
      currentPartyPin,
      identityKey,
      connectionState?.epoch ?? 0,
      connectionState?.reconnected === true && connectionState.recovered === false ? 1 : 0,
      lifecycleRecoveryEpoch,
    ].join(':');

    if (lastAttemptKeyRef.current === attemptKey) {
      return;
    }

    lastAttemptKeyRef.current = attemptKey;
    void tryRecoverPartySession(attemptKey);
  }, [
    connectionState,
    currentGuestId,
    currentPartyPin,
    currentPlayer,
    hasObservedCurrentPlayer,
    hasRecoverableObservedIdentity,
    isCurrentUserHost,
    joinedPartyId,
    lifecycleRecoveryEpoch,
    tryRecoverPartySession,
    userId,
  ]);

  return { shouldPreserveJoinedPartyId };
}

function usePartySessionRecoveryEpoch(): number {
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const bumpEpoch = () => {
      setEpoch(Date.now());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        bumpEpoch();
      }
    };

    window.addEventListener('online', bumpEpoch);
    window.addEventListener('pageshow', bumpEpoch);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', bumpEpoch);
      window.removeEventListener('pageshow', bumpEpoch);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return epoch;
}

function hasPartyIdentityMatch({
  currentGuestId,
  party,
  userId,
}: {
  readonly currentGuestId: GuestId | null;
  readonly party: PartyObservation | undefined;
  readonly userId: UserId | null;
}): boolean {
  if (party === undefined) {
    return false;
  }

  return party.players.some((player) => {
    if (player.identity.kind === PartyPlayerIdentityKind.User) {
      return userId !== null && player.identity.userId === userId;
    }

    return currentGuestId !== null && player.identity.guestId === currentGuestId;
  });
}

function shouldRecoverPartySession({
  connectionState,
  currentGuestId,
  currentPartyPin,
  currentPlayer,
  hasObservedCurrentPlayer,
  hasRecoverableObservedIdentity,
  isCurrentUserHost,
  joinedPartyId,
  lifecycleRecoveryEpoch,
  userId,
}: {
  readonly connectionState: PartyObservationConnectionState | null;
  readonly currentGuestId: GuestId | null;
  readonly currentPartyPin: PartyPin | null;
  readonly currentPlayer: PartyObservationPlayer | null;
  readonly hasObservedCurrentPlayer: boolean;
  readonly hasRecoverableObservedIdentity: boolean;
  readonly isCurrentUserHost: boolean;
  readonly joinedPartyId: PartyId | null;
  readonly lifecycleRecoveryEpoch: number;
  readonly userId: UserId | null;
}): boolean {
  if (isCurrentUserHost || currentPlayer !== null || currentPartyPin === null) {
    return false;
  }

  if (userId === null && currentGuestId === null) {
    return false;
  }

  const hasRecoveryEvidence = hasObservedCurrentPlayer || joinedPartyId !== null || hasRecoverableObservedIdentity;

  if (!hasRecoveryEvidence) {
    return false;
  }

  const hasReconnectSignal =
    connectionState?.reconnected === true &&
    connectionState.recovered === false &&
    Date.now() - connectionState.epoch <= sessionRecoverySignalWindowMs;

  const hasLifecycleSignal =
    lifecycleRecoveryEpoch > 0 && Date.now() - lifecycleRecoveryEpoch <= sessionRecoverySignalWindowMs;

  return hasReconnectSignal || hasLifecycleSignal;
}
