import { useEffect, useState } from 'react';
import { HostPartyRuntimeCommand } from '../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import type { PartyId, PartyPin } from '../../../../../domains/game/party/shared/entities/party';
import type { PartyActionId } from '../../../../../domains/game/party/shared/entities/party-action';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import type { StageId } from '../../../../../domains/game/party/shared/entities/party-stage';
import type { PartyRuntimeNoticeKind } from '../../../../../domains/game/party/shared/ports/party-observation.port';
import { useAuth } from '../../../../identity/contexts/auth-context';
import { usePresentationParams, usePresentationPathname } from '../../../../shared/routing/router';
import { usePartyLobbyHostRuntime } from '../../host/screens/use-party-lobby-host-runtime';
import { usePartyLobbyJoinSession } from '../../player/screens/use-party-lobby-join-session';
import { usePartyLobbyPlayerSession } from '../../player/screens/use-party-lobby-player-session';
import { useParty } from '../contexts/party-context';
import {
  type PartyIdParser,
  type PartyPinParser,
  type StageIdParser,
  usePartyDependencies,
} from '../contexts/party-dependencies-context';
import { PartyLobbyRuntimeRedirectResolver } from './party-lobby-runtime-redirect-resolver';
import { resolvePartyLobbyScreenViewModel } from './party-lobby-screen-view-model';
import { usePartyLobbyRouteContext } from './use-party-lobby-route-context';

export enum PartyLobbyRouteKind {
  PARTY_ID = 'partyId',
  PIN = 'pin',
}

export enum PartyScreenSection {
  LEADERBOARD = 'leaderboard',
  LOBBY = 'lobby',
  RESULT = 'result',
  STAGE = 'stage',
}

export interface PartyLobbyScreenProps {
  readonly routeKind?: PartyLobbyRouteKind;
  readonly normalizePin?: (pin: string | undefined) => PartyPin | null;
  readonly normalizePartyId?: (partyId: string | undefined) => PartyId | null;
  readonly resolveDashboardRoute?: () => string;
  readonly resolveHomeRoute?: () => string;
  readonly resolvePartyAbsoluteUrl?: (pin: PartyPin) => string;
  readonly resolvePartyLobbyRoute?: (partyId: PartyId) => string;
  readonly resolvePartyLeaderboardRoute?: (partyId: PartyId) => string;
  readonly resolvePartyResultRoute?: (partyId: PartyId, stageId: StageId) => string;
  readonly resolvePartyStageRoute?: (partyId: PartyId, stageId: StageId) => string;
  readonly resolveJoinPartyRoute?: (pin: PartyPin) => string;
  readonly screenSection?: PartyScreenSection;
}

export interface PartyLobbyScreenState {
  readonly advanceStage: () => Promise<void>;
  readonly cancelHostRuntimeConfirmation: () => void;
  readonly clearJoinErrorMessage: () => void;
  readonly confirmHostRuntimeConfirmation: () => Promise<void>;
  readonly errorMessage: string | null;
  readonly guestAvatarPreviewUri: string | null;
  readonly guestName: string;
  readonly hostRuntimeErrorMessage: string | null;
  readonly hasInvalidPinRoute: boolean;
  readonly isAuthenticated: boolean;
  readonly isJoinSubmitting: boolean;
  readonly joinPin: string;
  readonly joinErrorMessage: string | null;
  readonly joinParty: () => Promise<void>;
  readonly kickPlayer: (player: NonNullable<PartyObservation['players']>[number]) => Promise<void>;
  readonly leaveParty: () => Promise<void>;
  readonly normalizedPartyId: PartyId | null;
  readonly pendingHostRuntimeConfirmationCommand: HostPartyRuntimeCommand | null;
  readonly pendingKickedPlayerKey: string | null;
  readonly pendingPlayerActionId: PartyActionId | null;
  readonly pauseParty: () => Promise<void>;
  readonly pendingHostRuntimeCommand: HostPartyRuntimeCommand | null;
  readonly party: PartyObservation | undefined;
  readonly playerActionErrorMessage: string | null;
  readonly runtimeNoticeKind: PartyRuntimeNoticeKind | null;
  readonly requestEndParty: () => void;
  readonly redirectTo: string | null;
  readonly regenerateGuestAvatar: () => void;
  readonly regenerateGuestName: () => void;
  readonly restartStage: () => Promise<void>;
  readonly routeKind: PartyLobbyRouteKind;
  readonly resumeParty: () => Promise<void>;
  readonly revealStageResult: () => Promise<void>;
  readonly rewindParty: () => Promise<void>;
  readonly rewindStage: () => Promise<void>;
  readonly setGuestName: (value: string) => void;
  readonly startParty: () => Promise<void>;
  readonly submitAction: (actionId: PartyActionId) => Promise<void>;
}

function defaultNormalizePin(
  pin: string | undefined,
  partyPinIdentifier: PartyPinParser,
): PartyPin | null {
  return partyPinIdentifier.parseOrNull(pin);
}

export function resolveDefaultPartyAbsoluteUrl(pin: PartyPin): string {
  return `${window.location.origin}/join/${pin}`;
}

function defaultResolveHostedPartyRoute(partyId: PartyId): string {
  return `/party/${partyId}/lobby`;
}

function defaultResolvePartyLeaderboardRoute(partyId: PartyId): string {
  return `/party/${partyId}/final`;
}

function defaultResolvePartyResultRoute(partyId: PartyId, stageId: StageId): string {
  return `/party/${partyId}/stage/${stageId}/result`;
}

function defaultResolvePartyStageRoute(partyId: PartyId, stageId: StageId): string {
  return `/party/${partyId}/stage/${stageId}`;
}

function defaultResolveHomeRoute(): string {
  return '/';
}

function defaultResolveDashboardRoute(): string {
  return '/workspace/dashboard';
}

function defaultResolveJoinPartyRoute(pin: PartyPin): string {
  return `/join/${encodeURIComponent(pin)}`;
}

function defaultNormalizePartyId(
  partyId: string | undefined,
  partyIdentifier: PartyIdParser,
): PartyId | null {
  return partyIdentifier.parseOrNull(partyId);
}

function defaultNormalizeStageId(
  stageId: string | undefined,
  stageIdentifier: StageIdParser,
): StageId | null {
  return stageIdentifier.parseOrNull(stageId);
}

function resolveStageSegmentFromPathname(
  pathname: string,
  routeKind: PartyLobbyRouteKind,
): string | undefined {
  if (routeKind !== PartyLobbyRouteKind.PARTY_ID) {
    return undefined;
  }

  const match = /^\/party\/[^/]+\/stage\/([^/]+)(?:\/result)?$/.exec(pathname);

  return match?.[1];
}

export function usePartyLobbyScreenState({
  routeKind = PartyLobbyRouteKind.PIN,
  normalizePin,
  normalizePartyId,
  resolveDashboardRoute = defaultResolveDashboardRoute,
  resolveHomeRoute = defaultResolveHomeRoute,
  resolvePartyLobbyRoute = defaultResolveHostedPartyRoute,
  resolvePartyLeaderboardRoute = defaultResolvePartyLeaderboardRoute,
  resolvePartyResultRoute = defaultResolvePartyResultRoute,
  resolvePartyStageRoute = defaultResolvePartyStageRoute,
  resolveJoinPartyRoute = defaultResolveJoinPartyRoute,
  screenSection = PartyScreenSection.LOBBY,
}: PartyLobbyScreenProps): PartyLobbyScreenState {
  const { partyIdentifier, partyLobbyFacade, partyPinIdentifier, stageIdentifier } =
    usePartyDependencies();
  const { pin, partyId, stageId } = usePresentationParams<'pin' | 'partyId' | 'stageId'>();
  const pathname = usePresentationPathname();
  const resolvedNormalizePin =
    normalizePin ?? ((value: string | undefined) => defaultNormalizePin(value, partyPinIdentifier));
  const resolvedNormalizePartyId =
    normalizePartyId ??
    ((value: string | undefined) => defaultNormalizePartyId(value, partyIdentifier));
  const resolvedNormalizeStageId = (value: string | undefined) =>
    defaultNormalizeStageId(value, stageIdentifier);
  const normalizedPin = resolvedNormalizePin(pin);
  const normalizedPartyId = resolvedNormalizePartyId(partyId);
  const requestedStageId = resolvedNormalizeStageId(
    stageId ?? resolveStageSegmentFromPathname(pathname, routeKind),
  );
  const { user } = useAuth();
  const isAuthenticated = user !== null;
  const [joinErrorMessage, setJoinErrorMessage] = useState<string | null>(null);
  const [isJoinSubmitting, setIsJoinSubmitting] = useState(false);
  const [isLeaveSubmitting, setIsLeaveSubmitting] = useState(false);
  const [runtimeNoticeKind, setRuntimeNoticeKind] = useState<PartyRuntimeNoticeKind | null>(null);
  const [joinedPartyId, setJoinedPartyId] = useState<PartyId | null>(null);
  const [leaveRedirectTo, setLeaveRedirectTo] = useState<string | null>(null);
  const {
    consumeRuntimeNotice,
    getErrorByPartyId,
    getPartyByPartyId,
    getRuntimeNoticeByPartyId,
    observePartyById,
  } = useParty();
  const {
    bootstrapErrorMessage,
    bootstrapPartyByPin,
    party,
    partyIdErrorMessage,
    routeState,
    runtimeNotice,
  } = usePartyLobbyRouteContext({
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
  const viewModel = resolvePartyLobbyScreenViewModel({
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
    resolveHostedPartyRoute: resolvePartyLobbyRoute,
    resolveJoinPartyRoute,
    routeKind,
    routeState,
    userId: user?.id ?? null,
  });
  const currentPlayer = party?.players.find((player) => player.isCurrentPlayer) ?? null;
  const isCurrentUserHost = party?.isObserverHost ?? false;
  const {
    guestName,
    guestAvatarPreviewUri,
    joinParty,
    regenerateGuestAvatar,
    regenerateGuestName,
    setGuestName,
  } = usePartyLobbyJoinSession({
    currentGuestId,
    normalizedPin,
    onPartyJoined: setJoinedPartyId,
    partyLobbyFacade,
    persistedGuestJoinGuestId: viewModel.persistedGuestJoinGuestId,
    setIsJoinSubmitting,
    setJoinErrorMessage,
    user,
  });
  const { leaveParty, pendingPlayerActionId, playerActionErrorMessage, submitAction } =
    usePartyLobbyPlayerSession({
      clearGuestSessionOnObservedGuestRejoinFailure:
        viewModel.clearGuestSessionOnObservedGuestRejoinFailure,
      currentGuestId,
      observedGuestRejoinGuestId: viewModel.observedGuestRejoinGuestId,
      observedGuestRejoinUsername: viewModel.observedGuestRejoinUsername,
      onPartyLeft: () => setLeaveRedirectTo(resolveHomeRoute()),
      party,
      partyLobbyFacade,
      setIsLeaveSubmitting,
      setJoinErrorMessage,
    });
  const {
    cancelHostRuntimeConfirmation,
    confirmHostRuntimeConfirmation,
    hostRuntimeErrorMessage,
    kickPlayer,
    pendingKickedPlayerKey,
    pendingHostRuntimeCommand,
    pendingHostRuntimeConfirmationCommand,
    requestHostRuntimeConfirmation,
    runHostRuntimeCommand,
  } = usePartyLobbyHostRuntime({
    onEndPartyCompleted: () => setLeaveRedirectTo(resolveDashboardRoute()),
    party,
    partyLobbyFacade,
  });
  const runtimeRedirectTo = PartyLobbyRuntimeRedirectResolver.resolve({
    party,
    requestedStageId,
    resolvePartyLeaderboardRoute,
    resolvePartyLobbyRoute,
    resolvePartyResultRoute,
    resolvePartyStageRoute,
    screenSection,
  });

  useEffect(() => {
    if (runtimeNotice === null || isCurrentUserHost || currentPlayer === null) {
      return;
    }

    setRuntimeNoticeKind(runtimeNotice.kind);
    consumeRuntimeNotice(runtimeNotice);
  }, [consumeRuntimeNotice, currentPlayer, isCurrentUserHost, runtimeNotice]);

  useEffect(() => {
    if (!runtimeNoticeKind) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRuntimeNoticeKind(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [runtimeNoticeKind]);

  return {
    advanceStage: () => runHostRuntimeCommand(HostPartyRuntimeCommand.AdvanceStage),
    cancelHostRuntimeConfirmation,
    clearJoinErrorMessage: () => setJoinErrorMessage(null),
    confirmHostRuntimeConfirmation,
    errorMessage: viewModel.errorMessage,
    guestAvatarPreviewUri,
    guestName,
    hostRuntimeErrorMessage,
    hasInvalidPinRoute: routeKind === PartyLobbyRouteKind.PIN && normalizedPin === null,
    isAuthenticated,
    isJoinSubmitting,
    joinPin: viewModel.joinPin,
    joinErrorMessage,
    joinParty,
    kickPlayer,
    leaveParty,
    normalizedPartyId,
    pendingHostRuntimeConfirmationCommand,
    pendingKickedPlayerKey,
    pendingPlayerActionId,
    pauseParty: () => runHostRuntimeCommand(HostPartyRuntimeCommand.PauseParty),
    pendingHostRuntimeCommand,
    party,
    playerActionErrorMessage,
    runtimeNoticeKind,
    requestEndParty: () => {
      requestHostRuntimeConfirmation(HostPartyRuntimeCommand.EndParty);
    },
    redirectTo: viewModel.redirectTo ?? runtimeRedirectTo,
    regenerateGuestAvatar,
    regenerateGuestName,
    restartStage: async () => {
      requestHostRuntimeConfirmation(HostPartyRuntimeCommand.RestartStage);
    },
    routeKind,
    resumeParty: () => runHostRuntimeCommand(HostPartyRuntimeCommand.ResumeParty),
    revealStageResult: () => runHostRuntimeCommand(HostPartyRuntimeCommand.RevealStageResult),
    rewindParty: async () => {
      requestHostRuntimeConfirmation(HostPartyRuntimeCommand.RewindParty);
    },
    rewindStage: async () => {
      requestHostRuntimeConfirmation(HostPartyRuntimeCommand.RewindStage);
    },
    setGuestName,
    startParty: () => runHostRuntimeCommand(HostPartyRuntimeCommand.StartParty),
    submitAction,
  };
}
