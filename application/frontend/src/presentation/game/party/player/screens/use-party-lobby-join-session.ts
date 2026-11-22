import type { GuestId } from '@pleey/contracts/identity';
import type { PartyPin } from '@pleey/contracts/party';
import { PartyJoinReceiptStatus, PartyPlayerKind } from '@pleey/contracts/party';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { PartyLobbyGateway } from '../../../../../application/game/party/shared/facades/party-lobby.facade';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import { PartyManagementErrorCode } from '../../../../../domains/game/party/shared/errors/party-management-error-code';
import type { User } from '../../../../../domains/identity/entities/user';
import { usePartyDependencies } from '../../shared/contexts/party-dependencies-context';

interface UsePartyLobbyJoinSessionParams {
  readonly currentGuestId: GuestId | null;
  readonly currentPlayer: PartyObservation['players'] extends readonly unknown[]
    ? PartyObservation['players'][number] | null
    : null;
  readonly normalizedPin: PartyPin | null;
  readonly onPartyJoined: (partyId: PartyObservation['partyId']) => void;
  readonly partyLobbyFacade: PartyLobbyGateway;
  readonly partyObservation: PartyObservation | undefined;
  readonly persistedGuestJoinGuestId: GuestId | null;
  readonly setIsJoinSubmitting: (value: boolean) => void;
  readonly setJoinErrorMessage: (value: string | null) => void;
  readonly user: User | null;
}

interface UsePartyLobbyJoinSessionResult {
  readonly guestAvatarPreviewUri: string | null;
  readonly guestName: string;
  readonly isPasswordRequired: boolean;
  readonly partyPassword: string;
  readonly joinParty: () => Promise<void>;
  readonly regenerateGuestAvatar: () => void;
  readonly regenerateGuestName: () => void;
  readonly setGuestName: (value: string) => void;
  readonly setPartyPassword: (value: string) => void;
}

export function usePartyLobbyJoinSession({
  currentGuestId,
  currentPlayer,
  normalizedPin,
  onPartyJoined,
  partyLobbyFacade,
  partyObservation,
  persistedGuestJoinGuestId,
  setIsJoinSubmitting,
  setJoinErrorMessage,
  user,
}: UsePartyLobbyJoinSessionParams): UsePartyLobbyJoinSessionResult {
  const { guestPartyEntryDraftFactory } = usePartyDependencies();
  const [guestDraft] = useState(() => (currentGuestId === null ? guestPartyEntryDraftFactory.create() : null));
  const [guestAvatarSeed, setGuestAvatarSeed] = useState<string | null>(guestDraft?.avatarSeed ?? null);
  const [guestName, setGuestName] = useState(guestDraft?.guestName ?? '');
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [partyPassword, setPartyPassword] = useState('');
  const hasObservedCurrentPlayer = useRef(false);

  const joinParty = useEffectEvent(async () => {
    if (normalizedPin === null) {
      setJoinErrorMessage(PartyManagementErrorCode.PARTY_NOT_FOUND);
      return;
    }

    if (!user) {
      setJoinErrorMessage(PartyManagementErrorCode.GUEST_NAME_REQUIRED);
      return;
    }

    setIsJoinSubmitting(true);

    try {
      const normalizedPassword = partyPassword.trim();
      const receipt = await partyLobbyFacade.joinParty({
        partyPassword: normalizedPassword || undefined,
        pin: normalizedPin,
        playerIdentity: { kind: PartyPlayerKind.USER, userId: user.id },
        username: undefined,
      });

      if (receipt.status === PartyJoinReceiptStatus.REJECTED) {
        if (receipt.errorMessage === PartyManagementErrorCode.VALIDATION_FAILED) {
          setIsPasswordRequired(true);
        }
        setJoinErrorMessage(receipt.errorMessage);
        return;
      }

      if (receipt.player.identity.kind === PartyPlayerKind.GUEST) {
        partyLobbyFacade.setGuestId(normalizedPin, receipt.player.identity.guestId);
      }

      if (receipt.player.identity.kind === PartyPlayerKind.USER && currentGuestId) {
        partyLobbyFacade.clearGuestId(normalizedPin);
      }

      setIsPasswordRequired(false);
      setPartyPassword('');
      onPartyJoined(receipt.partyId);
      setJoinErrorMessage(null);
    } finally {
      setIsJoinSubmitting(false);
    }
  });

  useEffect(() => {
    setIsPasswordRequired(false);
    setPartyPassword('');
  }, []);

  useEffect(() => {
    if (currentPlayer !== null) {
      hasObservedCurrentPlayer.current = true;
    }
  }, [currentPlayer]);

  useEffect(() => {
    if (normalizedPin === null || persistedGuestJoinGuestId === null) {
      return;
    }

    let isCancelled = false;

    void partyLobbyFacade
      .rejoinParty({
        pin: normalizedPin,
        playerIdentity: {
          kind: PartyPlayerKind.GUEST,
          guestId: persistedGuestJoinGuestId,
        },
        username: undefined,
      })
      .then((receipt) => {
        if (isCancelled) {
          return;
        }

        if (receipt.status === PartyJoinReceiptStatus.ACCEPTED) {
          if (receipt.player.identity.kind === PartyPlayerKind.GUEST) {
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
  }, [normalizedPin, onPartyJoined, partyLobbyFacade, persistedGuestJoinGuestId, setJoinErrorMessage]);

  // Auto-rejoin for canonical lobby routes (partyId in URL, PIN from party observation)
  useEffect(() => {
    if (
      partyObservation === undefined ||
      normalizedPin !== null ||
      persistedGuestJoinGuestId === null ||
      currentPlayer !== null ||
      hasObservedCurrentPlayer.current
    ) {
      return;
    }

    let isCancelled = false;

    void partyLobbyFacade
      .rejoinParty({
        pin: partyObservation.pin,
        playerIdentity: {
          kind: PartyPlayerKind.GUEST,
          guestId: persistedGuestJoinGuestId,
        },
        username: undefined,
      })
      .then((receipt) => {
        if (isCancelled) {
          return;
        }

        if (receipt.status === PartyJoinReceiptStatus.ACCEPTED) {
          if (receipt.player.identity.kind === PartyPlayerKind.GUEST) {
            partyLobbyFacade.setGuestId(partyObservation.pin, receipt.player.identity.guestId);
          }

          onPartyJoined(receipt.partyId);
          setJoinErrorMessage(null);
          return;
        }

        partyLobbyFacade.clearGuestId(partyObservation.pin);
      });

    return () => {
      isCancelled = true;
    };
  }, [
    partyObservation,
    normalizedPin,
    currentPlayer,
    persistedGuestJoinGuestId,
    onPartyJoined,
    partyLobbyFacade,
    setJoinErrorMessage,
  ]);

  return {
    guestAvatarPreviewUri:
      guestAvatarSeed === null ? null : guestPartyEntryDraftFactory.createPreviewUrl(guestAvatarSeed),
    guestName,
    isPasswordRequired,
    partyPassword,
    joinParty,
    regenerateGuestAvatar: () => setGuestAvatarSeed(guestPartyEntryDraftFactory.createAvatarSeed()),
    regenerateGuestName: () => setGuestName(guestPartyEntryDraftFactory.createGuestName()),
    setGuestName,
    setPartyPassword,
  };
}
