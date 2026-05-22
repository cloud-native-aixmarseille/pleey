import { useEffect, useEffectEvent, useState } from 'react';
import type { PartyLobbyGateway } from '../../../../../application/game/party/shared/facades/party-lobby.facade';
import { PartyJoinReceiptStatus } from '../../../../../domains/game/party/player/ports/party-player.port';
import type { PartyPin } from '../../../../../domains/game/party/shared/entities/party';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import { PartyPlayerIdentityKind } from '../../../../../domains/game/party/shared/entities/party-player-identity';
import { PartyManagementErrorCode } from '../../../../../domains/game/party/shared/errors/party-management-error-code';
import type { GuestId } from '../../../../../domains/identity/entities/guest';
import type { User } from '../../../../../domains/identity/entities/user';

interface UsePartyLobbyJoinSessionParams {
  readonly currentGuestId: GuestId | null;
  readonly normalizedPin: PartyPin | null;
  readonly onPartyJoined: (partyId: PartyObservation['partyId']) => void;
  readonly partyLobbyFacade: PartyLobbyGateway;
  readonly persistedGuestJoinGuestId: GuestId | null;
  readonly setIsJoinSubmitting: (value: boolean) => void;
  readonly setJoinErrorMessage: (value: string | null) => void;
  readonly user: User | null;
}

interface UsePartyLobbyJoinSessionResult {
  readonly guestName: string;
  readonly joinParty: () => Promise<void>;
  readonly setGuestName: (value: string) => void;
}

export function usePartyLobbyJoinSession({
  currentGuestId,
  normalizedPin,
  onPartyJoined,
  partyLobbyFacade,
  persistedGuestJoinGuestId,
  setIsJoinSubmitting,
  setJoinErrorMessage,
  user,
}: UsePartyLobbyJoinSessionParams): UsePartyLobbyJoinSessionResult {
  const [guestName, setGuestName] = useState('');

  const joinParty = useEffectEvent(async () => {
    if (normalizedPin === null) {
      setJoinErrorMessage(PartyManagementErrorCode.PARTY_NOT_FOUND);
      return;
    }

    if (!user && guestName.trim().length === 0) {
      setJoinErrorMessage(PartyManagementErrorCode.GUEST_NAME_REQUIRED);
      return;
    }

    setIsJoinSubmitting(true);

    try {
      const receipt = await partyLobbyFacade.joinParty({
        pin: normalizedPin,
        playerIdentity: user
          ? { kind: PartyPlayerIdentityKind.User, userId: user.id }
          : currentGuestId === null
            ? { kind: PartyPlayerIdentityKind.Guest }
            : { kind: PartyPlayerIdentityKind.Guest, guestId: currentGuestId },
        username: user ? undefined : guestName.trim(),
      });

      if (receipt.status === PartyJoinReceiptStatus.REJECTED) {
        setJoinErrorMessage(receipt.errorMessage);
        return;
      }

      if (receipt.player.identity.kind === PartyPlayerIdentityKind.Guest) {
        partyLobbyFacade.setGuestId(normalizedPin, receipt.player.identity.guestId);
      }

      if (receipt.player.identity.kind === PartyPlayerIdentityKind.User && currentGuestId) {
        partyLobbyFacade.clearGuestId(normalizedPin);
      }

      onPartyJoined(receipt.partyId);
      setJoinErrorMessage(null);
    } finally {
      setIsJoinSubmitting(false);
    }
  });

  useEffect(() => {
    if (normalizedPin === null || persistedGuestJoinGuestId === null) {
      return;
    }

    let isCancelled = false;

    void partyLobbyFacade
      .rejoinParty({
        pin: normalizedPin,
        playerIdentity: {
          kind: PartyPlayerIdentityKind.Guest,
          guestId: persistedGuestJoinGuestId,
        },
        username: undefined,
      })
      .then((receipt) => {
        if (isCancelled) {
          return;
        }

        if (receipt.status === PartyJoinReceiptStatus.ACCEPTED) {
          if (receipt.player.identity.kind === PartyPlayerIdentityKind.Guest) {
            partyLobbyFacade.setGuestId(normalizedPin, receipt.player.identity.guestId);
          }

          onPartyJoined(receipt.partyId);
          setJoinErrorMessage(null);
          return;
        }

        partyLobbyFacade.clearGuestId(normalizedPin);
      });

    return () => {
      isCancelled = true;
    };
  }, [
    normalizedPin,
    onPartyJoined,
    partyLobbyFacade,
    persistedGuestJoinGuestId,
    setJoinErrorMessage,
  ]);

  return {
    guestName,
    joinParty,
    setGuestName,
  };
}
