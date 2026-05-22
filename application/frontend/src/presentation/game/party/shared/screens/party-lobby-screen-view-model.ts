import type {
  Party,
  PartyId,
  PartyPin,
} from '../../../../../domains/game/party/shared/entities/party';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import type { PartyObservationPlayer } from '../../../../../domains/game/party/shared/entities/party-observation-player';
import { PartyPlayerIdentityKind } from '../../../../../domains/game/party/shared/entities/party-player-identity';
import type { GuestId } from '../../../../../domains/identity/entities/guest';
import type { UserId } from '../../../../../domains/identity/entities/user';

export type PartyLobbyRouteKind = 'partyId' | 'pin';

interface PartyLobbyRouteState {
  readonly bootstrapRedirectTo: string | null;
  readonly resolvedPartyId: PartyId | null;
}

interface PartyLobbyScreenViewModel {
  readonly clearGuestSessionOnObservedGuestRejoinFailure: boolean;
  readonly errorMessage: string | null;
  readonly joinPin: string;
  readonly observedGuestRejoinGuestId: GuestId | null;
  readonly observedGuestRejoinUsername: string | undefined;
  readonly persistedGuestJoinGuestId: GuestId | null;
  readonly redirectTo: string | null;
}

export function resolvePartyLobbyRouteState({
  bootstrapCurrentParty,
  bootstrapPartyByPin,
  joinedPartyId,
  normalizedPartyId,
  resolveHostedPartyRoute,
  routeKind,
}: {
  readonly bootstrapCurrentParty: Party | null;
  readonly bootstrapPartyByPin: Party | null;
  readonly joinedPartyId: PartyId | null;
  readonly normalizedPartyId: PartyId | null;
  readonly resolveHostedPartyRoute: (partyId: PartyId) => string;
  readonly routeKind: PartyLobbyRouteKind;
}): PartyLobbyRouteState {
  const bootstrapRedirectTo =
    routeKind === 'pin' && bootstrapCurrentParty
      ? resolveHostedPartyRoute(bootstrapCurrentParty.partyId)
      : null;

  return {
    bootstrapRedirectTo,
    resolvedPartyId:
      routeKind === 'partyId'
        ? normalizedPartyId
        : bootstrapRedirectTo === null
          ? (bootstrapPartyByPin?.partyId ?? joinedPartyId)
          : null,
  };
}

export function resolvePartyLobbyScreenViewModel({
  bootstrapErrorMessage,
  bootstrapPartyByPin,
  currentGuestId,
  isJoinSubmitting,
  isLeaveSubmitting,
  joinErrorMessage,
  joinedPartyId,
  leaveRedirectTo,
  normalizedPin,
  party,
  partyIdErrorMessage,
  resolveHostedPartyRoute,
  resolveJoinPartyRoute,
  routeKind,
  routeState,
  userId,
}: {
  readonly bootstrapErrorMessage: string | null;
  readonly bootstrapPartyByPin: Party | null;
  readonly currentGuestId: GuestId | null;
  readonly isJoinSubmitting: boolean;
  readonly isLeaveSubmitting: boolean;
  readonly joinErrorMessage: string | null;
  readonly joinedPartyId: PartyId | null;
  readonly leaveRedirectTo: string | null;
  readonly normalizedPin: PartyPin | null;
  readonly party: PartyObservation | undefined;
  readonly partyIdErrorMessage: string | null;
  readonly resolveHostedPartyRoute: (partyId: PartyId) => string;
  readonly resolveJoinPartyRoute: (pin: PartyPin) => string;
  readonly routeKind: PartyLobbyRouteKind;
  readonly routeState: PartyLobbyRouteState;
  readonly userId: UserId | null;
}): PartyLobbyScreenViewModel {
  const currentPartyPin = normalizedPin ?? party?.pin ?? null;
  const currentPlayer = party ? findCurrentPlayer(party.players) : null;
  const isCurrentUserHost = party?.isObserverHost ?? false;
  const isCurrentPlayerLive = currentPlayer?.isLive ?? false;
  const isRecoveringPersistedGuestSession =
    routeKind === 'partyId' &&
    party !== undefined &&
    currentPartyPin !== null &&
    currentGuestId !== null &&
    currentPlayer === null;
  const pinRouteRedirectTo =
    routeKind === 'pin' && party && (isCurrentUserHost || currentPlayer !== null)
      ? resolveHostedPartyRoute(party.partyId)
      : null;
  const partyIdRouteRedirectTo =
    routeKind === 'partyId' &&
    party &&
    !isCurrentUserHost &&
    currentPlayer === null &&
    !isRecoveringPersistedGuestSession
      ? resolveJoinPartyRoute(party.pin)
      : null;
  const observedGuestRejoinPlayer =
    currentPlayer?.identity.kind === PartyPlayerIdentityKind.Guest && !isCurrentPlayerLive
      ? currentPlayer
      : null;
  const observedGuestRejoinGuestId =
    !party || currentPartyPin === null || isLeaveSubmitting || leaveRedirectTo !== null
      ? null
      : isRecoveringPersistedGuestSession
        ? currentGuestId
        : observedGuestRejoinPlayer
          ? currentGuestId
          : null;

  return {
    clearGuestSessionOnObservedGuestRejoinFailure: isRecoveringPersistedGuestSession,
    errorMessage: joinErrorMessage ?? partyIdErrorMessage ?? bootstrapErrorMessage,
    joinPin: bootstrapPartyByPin?.pin ?? normalizedPin ?? '',
    observedGuestRejoinGuestId,
    observedGuestRejoinUsername: observedGuestRejoinPlayer?.username,
    persistedGuestJoinGuestId:
      routeKind === 'pin' &&
      userId === null &&
      normalizedPin !== null &&
      currentGuestId !== null &&
      joinedPartyId === null &&
      leaveRedirectTo === null &&
      !isJoinSubmitting
        ? currentGuestId
        : null,
    redirectTo:
      leaveRedirectTo ??
      routeState.bootstrapRedirectTo ??
      pinRouteRedirectTo ??
      partyIdRouteRedirectTo,
  };
}

function findCurrentPlayer(
  players: readonly PartyObservationPlayer[],
): PartyObservationPlayer | null {
  return players.find((player) => player.isCurrentPlayer) ?? null;
}
