import type { PartyId } from '@pleey/contracts/party';
import type { PartyLobbyGateway } from '../../../../../application/game/party/shared/facades/party-lobby.facade';
import { useAuth } from '../../../../identity/contexts/auth-context';
import { usePresentationParams, usePresentationPathname } from '../../../../shared/routing/router';
import { useParty } from '../contexts/party-context';
import type { PartyIdParser, PartyPinParser, PartyStageIdParser } from '../contexts/party-dependencies-context';
import {
  defaultNormalizePartyId,
  defaultNormalizePartyStageId,
  defaultNormalizePin,
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
  readonly stageIdentifier: PartyStageIdParser;
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
  const resolvedNormalizePartyStageId = (value: string | undefined) =>
    defaultNormalizePartyStageId(value, stageIdentifier);
  const normalizedPin = resolvedNormalizePin(pin);
  const normalizedPartyId = resolvedNormalizePartyId(partyId);
  const requestedPartyStageId = resolvedNormalizePartyStageId(
    stageId ?? resolveStageSegmentFromPathname(pathname, routeKind),
  );
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
  const currentParticipantId = null;
  const connectionState = getConnectionStateByPartyId(routeState.resolvedPartyId);
  const viewModel = resolvePartyLobbyScreenViewModel({
    bootstrapErrorMessage,
    bootstrapPartyByPin,
    currentParticipantId,
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
    currentParticipantId,
    currentPartyPin,
    currentPlayer,
    isAuthenticated,
    isCurrentUserHost: party?.isObserverHost ?? false,
    normalizedPartyId,
    normalizedPin,
    party,
    requestedPartyStageId,
    runtimeNotice,
    user,
    viewModel,
  };
}
