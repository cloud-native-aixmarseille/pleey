import type { PartyLobbyGateway } from '../../../../../application/game/party/shared/facades/party-lobby.facade';
import type { PartyId } from '../../../../../domains/game/party/shared/entities/party';
import { useAuth } from '../../../../identity/contexts/auth-context';
import { usePresentationParams, usePresentationPathname } from '../../../../shared/routing/router';
import { useParty } from '../contexts/party-context';
import type { PartyIdParser, PartyPinParser, StageIdParser } from '../contexts/party-dependencies-context';
import {
  defaultNormalizePartyId,
  defaultNormalizePin,
  defaultNormalizeStageId,
  type PartyLobbyRouteKind,
  resolveStageSegmentFromPathname,
} from './party-lobby-screen-route-utils';
import { resolvePartyLobbyScreenViewModel } from './party-lobby-screen-view-model';
import { usePartyLobbyRouteContext } from './use-party-lobby-route-context';
import type { PartyLobbyScreenProps } from './use-party-lobby-screen-state';

interface UsePartyLobbyScreenViewStateParams {
  readonly isJoinSubmitting: boolean;
  readonly joinErrorMessage: string | null;
  readonly joinedPartyId: PartyId | null;
  readonly leaveRedirectTo: string | null;
  readonly normalizePartyId: PartyLobbyScreenProps['normalizePartyId'];
  readonly normalizePin: PartyLobbyScreenProps['normalizePin'];
  readonly partyIdentifier: PartyIdParser;
  readonly partyLobbyFacade: PartyLobbyGateway;
  readonly partyPinIdentifier: PartyPinParser;
  readonly resolveJoinPartyRoute: NonNullable<PartyLobbyScreenProps['resolveJoinPartyRoute']>;
  readonly resolvePartyLobbyRoute: NonNullable<PartyLobbyScreenProps['resolvePartyLobbyRoute']>;
  readonly routeKind: PartyLobbyRouteKind;
  readonly stageIdentifier: StageIdParser;
}

export function usePartyLobbyScreenViewState({
  isJoinSubmitting,
  joinErrorMessage,
  joinedPartyId,
  leaveRedirectTo,
  normalizePartyId,
  normalizePin,
  partyIdentifier,
  partyLobbyFacade,
  partyPinIdentifier,
  resolveJoinPartyRoute,
  resolvePartyLobbyRoute,
  routeKind,
  stageIdentifier,
}: UsePartyLobbyScreenViewStateParams) {
  const { pin, partyId, stageId } = usePresentationParams<'pin' | 'partyId' | 'stageId'>();
  const pathname = usePresentationPathname();
  const { user } = useAuth();
  const isAuthenticated = user !== null;
  const {
    consumeRuntimeNotice,
    getConnectionStateByPartyId,
    getErrorByPartyId,
    getPartyByPartyId,
    getRuntimeNoticeByPartyId,
    observePartyById,
  } = useParty();
  const resolvedNormalizePin =
    normalizePin ?? ((value: string | undefined) => defaultNormalizePin(value, partyPinIdentifier));
  const resolvedNormalizePartyId =
    normalizePartyId ?? ((value: string | undefined) => defaultNormalizePartyId(value, partyIdentifier));
  const resolvedNormalizeStageId = (value: string | undefined) => defaultNormalizeStageId(value, stageIdentifier);
  const normalizedPin = resolvedNormalizePin(pin);
  const normalizedPartyId = resolvedNormalizePartyId(partyId);
  const requestedStageId = resolvedNormalizeStageId(stageId ?? resolveStageSegmentFromPathname(pathname, routeKind));
  const { bootstrapErrorMessage, bootstrapPartyByPin, party, partyIdErrorMessage, routeState, runtimeNotice } =
    usePartyLobbyRouteContext({
      getErrorByPartyId,
      getPartyByPartyId,
      getRuntimeNoticeByPartyId,
      isAuthenticated,
      joinedPartyId,
      normalizedPartyId,
      normalizedPin,
      observePartyById,
      partyLobbyFacade,
      resolvePartyLobbyRoute,
      routeKind,
    });
  const currentPartyPin = normalizedPin ?? party?.pin ?? null;
  const currentGuestId = currentPartyPin ? partyLobbyFacade.getGuestId(currentPartyPin) : null;
  const connectionState = getConnectionStateByPartyId(routeState.resolvedPartyId);
  const viewModel = resolvePartyLobbyScreenViewModel({
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
    resolveHostedPartyRoute: resolvePartyLobbyRoute,
    resolveJoinPartyRoute,
    routeKind,
    routeState,
    userId: user?.id ?? null,
  });
  const currentPlayer = party?.players.find((player) => player.isCurrentPlayer) ?? null;

  return {
    connectionState,
    consumeRuntimeNotice,
    currentGuestId,
    currentPartyPin,
    currentPlayer,
    isAuthenticated,
    isCurrentUserHost: party?.isObserverHost ?? false,
    normalizedPartyId,
    normalizedPin,
    party,
    requestedStageId,
    runtimeNotice,
    user,
    viewModel,
  };
}
