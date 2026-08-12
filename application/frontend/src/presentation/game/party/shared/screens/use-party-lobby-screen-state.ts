import { useEffect, useRef, useState } from 'react';
import { HostPartyRuntimeCommand } from '../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import type { PartyId, PartyPin } from '../../../../../domains/game/party/shared/entities/party';
import type { PartyActionId } from '../../../../../domains/game/party/shared/entities/party-action';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import type { StageId } from '../../../../../domains/game/party/shared/entities/party-stage';
import type { PartyRuntimeNoticeKind } from '../../../../../domains/game/party/shared/ports/party-observation.port';
import { usePartyLobbyHostRuntime } from '../../host/screens/use-party-lobby-host-runtime';
import { usePartyLobbyJoinSession } from '../../player/screens/use-party-lobby-join-session';
import { usePartyLobbyPlayerSession } from '../../player/screens/use-party-lobby-player-session';
import { usePartyDependencies } from '../contexts/party-dependencies-context';
import {
  defaultResolveDashboardRoute,
  defaultResolveHomeRoute,
  defaultResolveHostedPartyRoute,
  defaultResolveJoinPartyRoute,
  defaultResolvePartyLeaderboardRoute,
  defaultResolvePartyResultRoute,
  defaultResolvePartyStageRoute,
  PartyLobbyRouteKind,
  PartyScreenSection,
} from './party-lobby-screen-route-utils';
import { usePartyLobbyScreenViewState } from './use-party-lobby-screen-view-state';
import { usePartySessionRecovery } from './use-party-session-recovery';

export {
  PartyLobbyRouteKind,
  PartyScreenSection,
  resolveDefaultPartyAbsoluteUrl,
} from './party-lobby-screen-route-utils';

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
  readonly joinPartyRequiresPassword: boolean;
  readonly joinPartyPassword: string;
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
  readonly setJoinPartyPassword: (value: string) => void;
  readonly startParty: () => Promise<void>;
  readonly submitAction: (actionId: PartyActionId) => Promise<void>;
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
  const { partyIdentifier, partyLobbyFacade, partyLobbyRuntimeRedirectResolver, partyPinIdentifier, stageIdentifier } =
    usePartyDependencies();
  const [joinErrorMessage, setJoinErrorMessage] = useState<string | null>(null);
  const [isJoinSubmitting, setIsJoinSubmitting] = useState(false);
  const [, setIsLeaveSubmitting] = useState(false);
  const [runtimeNoticeKind, setRuntimeNoticeKind] = useState<PartyRuntimeNoticeKind | null>(null);
  const [joinedPartyId, setJoinedPartyId] = useState<PartyId | null>(null);
  const [leaveRedirectTo, setLeaveRedirectTo] = useState<string | null>(null);
  const {
    consumeRuntimeNotice,
    connectionState,
    currentGuestId,
    currentPartyPin,
    currentPlayer,
    isAuthenticated,
    isCurrentUserHost,
    normalizedPartyId,
    normalizedPin,
    party,
    requestedStageId,
    runtimeNotice,
    user,
    viewModel,
  } = usePartyLobbyScreenViewState({
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
  });
  const hasObservedCurrentPlayerRef = useRef(currentPlayer !== null);
  const { shouldPreserveJoinedPartyId } = usePartySessionRecovery({
    connectionState,
    currentGuestId,
    currentPartyPin,
    currentPlayer,
    hasObservedCurrentPlayer: hasObservedCurrentPlayerRef.current,
    isCurrentUserHost,
    joinedPartyId,
    party,
    partyLobbyFacade,
    setJoinErrorMessage,
    setJoinedPartyId,
    userId: user?.id ?? null,
  });
  const {
    guestName,
    isPasswordRequired,
    partyPassword,
    guestAvatarPreviewUri,
    joinParty,
    regenerateGuestAvatar,
    regenerateGuestName,
    setGuestName,
    setPartyPassword,
  } = usePartyLobbyJoinSession({
    currentGuestId,
    currentPlayer,
    normalizedPin,
    onPartyJoined: setJoinedPartyId,
    partyLobbyFacade,
    partyObservation: party,
    persistedGuestJoinGuestId: viewModel.persistedGuestJoinGuestId,
    setIsJoinSubmitting,
    setJoinErrorMessage,
    user,
  });
  const { leaveParty, pendingPlayerActionId, playerActionErrorMessage, submitAction } = usePartyLobbyPlayerSession({
    currentGuestId,
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
  const runtimeRedirectTo = partyLobbyRuntimeRedirectResolver.resolve({
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

  useEffect(() => {
    if (currentPlayer !== null) {
      hasObservedCurrentPlayerRef.current = true;
      return;
    }

    if (!hasObservedCurrentPlayerRef.current) {
      return;
    }

    if (shouldPreserveJoinedPartyId) {
      return;
    }

    hasObservedCurrentPlayerRef.current = false;
    setJoinedPartyId(null);
  }, [currentPlayer, shouldPreserveJoinedPartyId]);

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
    joinPartyRequiresPassword: isPasswordRequired,
    joinPartyPassword: partyPassword,
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
    setJoinPartyPassword: setPartyPassword,
    startParty: () => runHostRuntimeCommand(HostPartyRuntimeCommand.StartParty),
    submitAction,
  };
}
