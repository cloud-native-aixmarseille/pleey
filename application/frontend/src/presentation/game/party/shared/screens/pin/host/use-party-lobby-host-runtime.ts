import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { PartyLobbyGateway } from '../../../../../../../application/game/party/shared/facades/party-lobby.facade';
import {
  HostPartyRuntimeCommand,
  type HostPartyRuntimeControlsState,
} from '../../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { PartyManagementErrorCode } from '../../../../../../../domains/game/party/shared/errors/party-management-error-code';
import { usePartyDependencies } from '../../../contexts/party-dependencies-context';

interface UsePartyLobbyHostRuntimeParams {
  readonly onEndPartyCompleted: () => void;
  readonly party: PartyObservation | undefined;
  readonly partyLobbyFacade: PartyLobbyGateway;
}

interface UsePartyLobbyHostRuntimeResult {
  readonly cancelHostRuntimeConfirmation: () => void;
  readonly confirmHostRuntimeConfirmation: () => Promise<void>;
  readonly hostRuntimeErrorMessage: string | null;
  readonly pendingHostRuntimeCommand: HostPartyRuntimeCommand | null;
  readonly pendingHostRuntimeConfirmationCommand: HostPartyRuntimeCommand | null;
  readonly requestHostRuntimeConfirmation: (command: HostPartyRuntimeCommand) => void;
  readonly runHostRuntimeCommand: (command: HostPartyRuntimeCommand) => Promise<void>;
}

export function usePartyLobbyHostRuntime({
  onEndPartyCompleted,
  party,
  partyLobbyFacade,
}: UsePartyLobbyHostRuntimeParams): UsePartyLobbyHostRuntimeResult {
  const { hostPartyRuntimeControlsResolver } = usePartyDependencies();
  const [hostRuntimeErrorMessage, setHostRuntimeErrorMessage] = useState<string | null>(null);
  const [pendingHostRuntimeCommand, setPendingHostRuntimeCommand] =
    useState<HostPartyRuntimeCommand | null>(null);
  const [pendingHostRuntimeConfirmationCommand, setPendingHostRuntimeConfirmationCommand] =
    useState<HostPartyRuntimeCommand | null>(null);
  const autoRevealedStageKeyRef = useRef<string | null>(null);
  const hostRuntimeControls: HostPartyRuntimeControlsState | null = party
    ? hostPartyRuntimeControlsResolver.resolveControls(party)
    : null;

  useEffect(() => {
    setHostRuntimeErrorMessage(null);
    setPendingHostRuntimeConfirmationCommand(null);
    setPendingHostRuntimeCommand(null);
  }, [
    party?.context?.lifecycle.phase,
    party?.context?.lifecycle.stageId,
    party?.context?.lifecycle.totalStages,
    party?.status,
  ]);

  const runHostRuntimeCommand = useEffectEvent(async (command: HostPartyRuntimeCommand) => {
    if (!party) {
      return;
    }

    setPendingHostRuntimeCommand(command);
    setPendingHostRuntimeConfirmationCommand(null);
    setHostRuntimeErrorMessage(null);

    try {
      await partyLobbyFacade.executeHostRuntimeCommand(command, party.partyId);

      if (command === HostPartyRuntimeCommand.EndParty) {
        onEndPartyCompleted();
      }
    } catch (error) {
      setHostRuntimeErrorMessage(
        error instanceof Error ? error.message : PartyManagementErrorCode.OBSERVE_FAILED,
      );
    } finally {
      setPendingHostRuntimeCommand(null);
    }
  });

  const requestHostRuntimeConfirmation = useEffectEvent((command: HostPartyRuntimeCommand) => {
    setHostRuntimeErrorMessage(null);
    setPendingHostRuntimeConfirmationCommand(command);
  });

  const confirmHostRuntimeConfirmation = useEffectEvent(async () => {
    if (pendingHostRuntimeConfirmationCommand === null) {
      return;
    }

    await runHostRuntimeCommand(pendingHostRuntimeConfirmationCommand);
  });

  useEffect(() => {
    const currentStageId = party?.context?.stage?.current?.stageId;
    const actionSubmission = party?.context?.stage?.actionSubmission;
    const isComplete =
      actionSubmission !== null &&
      actionSubmission !== undefined &&
      actionSubmission.totalEligiblePlayerCount > 0 &&
      actionSubmission.submittedPlayerCount >= actionSubmission.totalEligiblePlayerCount;

    if (
      !party ||
      !party.isObserverHost ||
      party.context?.lifecycle.phase !== 'stage' ||
      currentStageId === null ||
      currentStageId === undefined ||
      !hostRuntimeControls?.canRevealStageResult ||
      pendingHostRuntimeCommand !== null ||
      !isComplete
    ) {
      if (party?.context?.lifecycle.phase !== 'stage') {
        autoRevealedStageKeyRef.current = null;
      }

      return;
    }

    const stageKey = `${party.partyId}:${currentStageId}`;

    if (autoRevealedStageKeyRef.current === stageKey) {
      return;
    }

    autoRevealedStageKeyRef.current = stageKey;
    void runHostRuntimeCommand(HostPartyRuntimeCommand.RevealStageResult);
  }, [
    hostRuntimeControls?.canRevealStageResult,
    party,
    pendingHostRuntimeCommand,
    runHostRuntimeCommand,
  ]);

  return {
    cancelHostRuntimeConfirmation: () => setPendingHostRuntimeConfirmationCommand(null),
    confirmHostRuntimeConfirmation,
    hostRuntimeErrorMessage,
    pendingHostRuntimeCommand,
    pendingHostRuntimeConfirmationCommand,
    requestHostRuntimeConfirmation,
    runHostRuntimeCommand,
  };
}
