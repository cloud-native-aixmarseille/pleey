import type { ParticipantId } from '@pleey/contracts/identity';
import type { PartyPin } from '@pleey/contracts/party';
import { PartyJoinReceiptStatus, PartyPlayerKind } from '@pleey/contracts/party';
import { useEffect, useEffectEvent, useState } from 'react';
import type { PartyLobbyGateway } from '../../../../../application/game/party/shared/facades/party-lobby.facade';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import { PartyManagementErrorCode } from '../../../../../domains/game/party/shared/errors/party-management-error-code';
import type { User } from '../../../../../domains/identity/entities/user';
import { useAuth } from '../../../../identity/contexts/auth-context';
import { usePartyDependencies } from '../../shared/contexts/party-dependencies-context';

interface UsePartyLobbyJoinSessionParams {
  readonly currentParticipantId: ParticipantId | null;
  readonly currentPlayer: PartyObservation['players'] extends readonly unknown[]
    ? PartyObservation['players'][number] | null
    : null;
  readonly normalizedPin: PartyPin | null;
  readonly onPartyJoined: (partyId: PartyObservation['partyId']) => void;
  readonly partyLobbyFacade: PartyLobbyGateway;
  readonly partyObservation: PartyObservation | undefined;
  readonly persistedGuestJoinParticipantId: ParticipantId | null;
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
  currentParticipantId,
  normalizedPin,
  onPartyJoined,
  partyLobbyFacade,
  setIsJoinSubmitting,
  setJoinErrorMessage,
  user,
}: UsePartyLobbyJoinSessionParams): UsePartyLobbyJoinSessionResult {
  const { guestPartyEntryDraftFactory } = usePartyDependencies();
  const { ensureAnonymousSession } = useAuth();
  const [guestDraft] = useState(() => (currentParticipantId === null ? guestPartyEntryDraftFactory.create() : null));
  const [guestAvatarSeed, setGuestAvatarSeed] = useState<string | null>(guestDraft?.avatarSeed ?? null);
  const [guestName, setGuestName] = useState(guestDraft?.guestName ?? '');
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [partyPassword, setPartyPassword] = useState('');

  const joinParty = useEffectEvent(async () => {
    if (normalizedPin === null) {
      setJoinErrorMessage(PartyManagementErrorCode.PARTY_NOT_FOUND);
      return;
    }

    setJoinErrorMessage(null);
    setIsJoinSubmitting(true);

    try {
      const confirmedUser = user ?? (await ensureAnonymousSession());
      const normalizedPassword = partyPassword.trim();
      const receipt = await partyLobbyFacade.joinParty({
        partyPassword: normalizedPassword || undefined,
        pin: normalizedPin,
        playerIdentity: { kind: PartyPlayerKind.USER, userId: confirmedUser.id },
        username: undefined,
      });

      if (receipt.status === PartyJoinReceiptStatus.REJECTED) {
        if (receipt.errorMessage === PartyManagementErrorCode.VALIDATION_FAILED) {
          setIsPasswordRequired(true);
        }
        setJoinErrorMessage(receipt.errorMessage);
        return;
      }

      setIsPasswordRequired(false);
      setPartyPassword('');
      onPartyJoined(receipt.partyId);
      setJoinErrorMessage(null);
    } catch {
      setJoinErrorMessage(PartyManagementErrorCode.CONNECTION_LOST);
    } finally {
      setIsJoinSubmitting(false);
    }
  });

  useEffect(() => {
    setIsPasswordRequired(false);
    setPartyPassword('');
  }, []);

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
