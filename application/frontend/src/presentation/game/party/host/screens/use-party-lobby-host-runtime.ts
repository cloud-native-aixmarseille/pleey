import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { PartyLobbyGateway } from '../../../../../application/game/party/shared/facades/party-lobby.facade';
import {
  HostPartyRuntimeCommand,
  type HostPartyRuntimeControlsState,
} from '../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import type { PartyObservationPlayer } from '../../../../../domains/game/party/shared/entities/party-observation-player';
import { PartyPlayerIdentityKind } from '../../../../../domains/game/party/shared/entities/party-player-identity';
import { PartyManagementErrorCode } from '../../../../../domains/game/party/shared/errors/party-management-error-code';
import { usePresentationFeedbackChannel } from '../../../../shared/ui/feedback/use-presentation-feedback-channel';
import { usePartyDependencies } from '../../shared/contexts/party-dependencies-context';

interface UsePartyLobbyHostRuntimeParams {
  readonly onEndPartyCompleted: () => void;
  readonly party: PartyObservation | undefined;
  readonly partyLobbyFacade: PartyLobbyGateway;
}

interface UsePartyLobbyHostRuntimeResult {
  readonly cancelHostRuntimeConfirmation: () => void;
  readonly confirmHostRuntimeConfirmation: () => Promise<void>;
  readonly hostRuntimeErrorMessage: string | null;
  readonly kickPlayer: (player: PartyObservationPlayer) => Promise<void>;
  readonly pendingKickedPlayerKey: string | null;
  readonly pendingHostRuntimeCommand: HostPartyRuntimeCommand | null;
  readonly pendingHostRuntimeConfirmationCommand: HostPartyRuntimeCommand | null;
  readonly requestHostRuntimeConfirmation: (command: HostPartyRuntimeCommand) => void;
  readonly runHostRuntimeCommand: (command: HostPartyRuntimeCommand) => Promise<void>;
}

function toPlayerKey(player: PartyObservationPlayer): string {
  return player.identity.kind === PartyPlayerIdentityKind.User
    ? `user:${player.identity.userId}`
    : `guest:${player.identity.guestId}`;
}

function resolveHostRuntimeObservationKey(party: PartyObservation | undefined): string {
  if (!party) {
    return 'party:missing';
  }

  const lifecycle = party.context?.lifecycle;

  return [
    party.status,
    lifecycle?.phase ?? 'lifecycle:missing',
    lifecycle?.stageId ?? 'stage:missing',
    lifecycle?.totalStages ?? 'totalStages:missing',
    lifecycle?.stageEndsAtEpochMs ?? 'stageEndsAt:missing',
    lifecycle?.stageRemainingDurationMs ?? 'stageRemaining:missing',
  ].join('|');
}

export function usePartyLobbyHostRuntime({
  onEndPartyCompleted,
  party,
  partyLobbyFacade,
}: UsePartyLobbyHostRuntimeParams): UsePartyLobbyHostRuntimeResult {
  const { hostPartyRuntimeControlsResolver } = usePartyDependencies();
  const feedback = usePresentationFeedbackChannel();
  const clearError = feedback.clearError;
  const [pendingKickedPlayerKey, setPendingKickedPlayerKey] = useState<string | null>(null);
  const [pendingHostRuntimeCommand, setPendingHostRuntimeCommand] =
    useState<HostPartyRuntimeCommand | null>(null);
  const [pendingHostRuntimeObservationKey, setPendingHostRuntimeObservationKey] = useState<
    string | null
  >(null);
  const [pendingHostRuntimeConfirmationCommand, setPendingHostRuntimeConfirmationCommand] =
    useState<HostPartyRuntimeCommand | null>(null);
  const autoRevealedStageKeyRef = useRef<string | null>(null);
  const hostRuntimeControls: HostPartyRuntimeControlsState | null = party
    ? hostPartyRuntimeControlsResolver.resolveControls(party)
    : null;
  const hostRuntimeObservationKey = resolveHostRuntimeObservationKey(party);
  const hasObservedPendingCommandCompletion =
    pendingHostRuntimeCommand !== null &&
    pendingHostRuntimeObservationKey !== null &&
    pendingHostRuntimeObservationKey !== hostRuntimeObservationKey;
  const effectivePendingHostRuntimeCommand = hasObservedPendingCommandCompletion
    ? null
    : pendingHostRuntimeCommand;

  useEffect(() => {
    clearError();
    setPendingHostRuntimeConfirmationCommand(null);
    // Reset host runtime feedback once on mount. Keeping this mount-only avoids
    // clearing confirmation intent during regular re-renders.
  }, []);

  useEffect(() => {
    if (!hasObservedPendingCommandCompletion) {
      return;
    }

    setPendingHostRuntimeCommand(null);
    setPendingHostRuntimeObservationKey(null);
  }, [hasObservedPendingCommandCompletion]);

  const runHostRuntimeCommand = useEffectEvent(async (command: HostPartyRuntimeCommand) => {
    if (!party) {
      return;
    }

    setPendingHostRuntimeObservationKey(resolveHostRuntimeObservationKey(party));
    setPendingHostRuntimeCommand(command);
    setPendingHostRuntimeConfirmationCommand(null);
    clearError();

    try {
      await partyLobbyFacade.executeHostRuntimeCommand(command, party.partyId);

      if (command === HostPartyRuntimeCommand.EndParty) {
        onEndPartyCompleted();
      }
    } catch (error) {
      setPendingHostRuntimeCommand(null);
      setPendingHostRuntimeObservationKey(null);
      feedback.handleError(error, {
        fallbackMessage: PartyManagementErrorCode.OBSERVE_FAILED,
        id: 'party-host-runtime-command-error-toast',
        notify: true,
      });
    }
  });

  const requestHostRuntimeConfirmation = useEffectEvent((command: HostPartyRuntimeCommand) => {
    clearError();
    setPendingHostRuntimeConfirmationCommand(command);
  });

  const kickPlayer = useEffectEvent(async (player: PartyObservationPlayer) => {
    if (!party) {
      return;
    }

    setPendingKickedPlayerKey(toPlayerKey(player));
    clearError();

    try {
      await partyLobbyFacade.kickPlayer({
        partyId: party.partyId,
        playerIdentity: player.identity,
      });
    } catch (error) {
      feedback.handleError(error, {
        fallbackMessage: PartyManagementErrorCode.OBSERVE_FAILED,
        id: 'party-host-runtime-kick-error-toast',
        notify: true,
      });
    } finally {
      setPendingKickedPlayerKey(null);
    }
  });

  const confirmHostRuntimeConfirmation = useEffectEvent(async () => {
    if (pendingHostRuntimeConfirmationCommand === null) {
      return;
    }

    await runHostRuntimeCommand(pendingHostRuntimeConfirmationCommand);
  });

  useEffect(() => {
    const currentStageId = party?.context?.lifecycle.stageId;
    const actionSubmission = party?.context?.stage?.actionSubmission;
    const stageEndsAtEpochMs = party?.context?.lifecycle.stageEndsAtEpochMs;
    const hasStageTimer = stageEndsAtEpochMs !== null && stageEndsAtEpochMs !== undefined;
    const isComplete =
      actionSubmission !== null &&
      actionSubmission !== undefined &&
      actionSubmission.totalEligiblePlayerCount > 0 &&
      actionSubmission.submittedPlayerCount >= actionSubmission.totalEligiblePlayerCount;

    if (
      !party?.isObserverHost ||
      party.context?.lifecycle.phase !== 'stage' ||
      currentStageId === null ||
      currentStageId === undefined ||
      !hostRuntimeControls?.canRevealStageResult ||
      effectivePendingHostRuntimeCommand !== null ||
      (!isComplete && !hasStageTimer)
    ) {
      if (party?.context?.lifecycle.phase !== 'stage') {
        autoRevealedStageKeyRef.current = null;
      }

      return;
    }

    const stageKey = `${party.partyId}:${currentStageId}`;
    const revealStageResult = () => {
      if (autoRevealedStageKeyRef.current === stageKey) {
        return;
      }

      autoRevealedStageKeyRef.current = stageKey;
      void runHostRuntimeCommand(HostPartyRuntimeCommand.RevealStageResult);
    };

    if (isComplete) {
      revealStageResult();
      return;
    }

    if (!hasStageTimer) {
      return;
    }

    const remainingDurationMs = stageEndsAtEpochMs - Date.now();

    if (remainingDurationMs <= 0) {
      revealStageResult();
      return;
    }

    const timeoutId = window.setTimeout(revealStageResult, remainingDurationMs);

    return () => window.clearTimeout(timeoutId);
  }, [hostRuntimeControls?.canRevealStageResult, effectivePendingHostRuntimeCommand, party]);

  return {
    cancelHostRuntimeConfirmation: () => setPendingHostRuntimeConfirmationCommand(null),
    confirmHostRuntimeConfirmation,
    hostRuntimeErrorMessage: feedback.errorMessage,
    kickPlayer,
    pendingKickedPlayerKey,
    pendingHostRuntimeCommand: effectivePendingHostRuntimeCommand,
    pendingHostRuntimeConfirmationCommand,
    requestHostRuntimeConfirmation,
    runHostRuntimeCommand,
  };
}
