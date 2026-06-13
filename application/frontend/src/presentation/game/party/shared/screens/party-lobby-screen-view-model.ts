import type {
  Party,
  PartyId,
  PartyPin,
} from '../../../../../domains/game/party/shared/entities/party';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import type { PartyObservationPlayer } from '../../../../../domains/game/party/shared/entities/party-observation-player';
import type { GuestId } from '../../../../../domains/identity/entities/guest';
import type { UserId } from '../../../../../domains/identity/entities/user';

export type PartyLobbyRouteKind = 'partyId' | 'pin';

interface PartyLobbyRouteState {
  readonly bootstrapRedirectTo: string | null;
  readonly resolvedPartyId: PartyId | null;
}

interface PartyLobbyScreenViewModel {
  readonly errorMessage: string | null;
  readonly joinPin: string;
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
  const canReusePersistedGuestIdentity =
    userId === null &&
    currentPartyPin !== null &&
    currentGuestId !== null &&
    joinedPartyId === null &&
    leaveRedirectTo === null &&
    !isJoinSubmitting &&
    ((routeKind === 'pin' && normalizedPin !== null) ||
      (routeKind === 'partyId' && party !== undefined && currentPlayer === null));

  return {
    errorMessage: joinErrorMessage ?? partyIdErrorMessage ?? bootstrapErrorMessage,
    joinPin: bootstrapPartyByPin?.pin ?? normalizedPin ?? '',
    persistedGuestJoinGuestId: canReusePersistedGuestIdentity ? currentGuestId : null,
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
