import type { ReactNode } from 'react';
import type { HostPartyRuntimeCommand } from '../../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { ContentStack } from '../../../../../../shared/ui/layout/containers';
import { HostAdvanceStageAction } from './host-advance-stage-action';
import { HostPartyPlayersPanel } from './host-party-players-panel';
import { HostPartyStatusBar } from './host-party-status-bar';
import { HostRuntimeConfirmationDialog } from './host-runtime-confirmation-dialog';
import { useHostRuntimeControls } from './use-host-runtime-controls';

interface HostRuntimeSurfaceProps {
  readonly pendingHostRuntimeConfirmationCommand: HostPartyRuntimeCommand | null;
  readonly pendingHostRuntimeCommand: HostPartyRuntimeCommand | null;
  readonly party: PartyObservation;
  readonly runtimePanel: ReactNode;
  readonly onAdvanceStage: () => void;
  readonly onCancelHostRuntimeConfirmation: () => void;
  readonly onConfirmHostRuntimeConfirmation: () => void;
  readonly onPauseParty: () => void;
  readonly onRequestEndParty: () => void;
  readonly onRestartStage: () => void;
  readonly onResumeParty: () => void;
  readonly onRevealStageResult: () => void;
  readonly onRewindParty: () => void;
  readonly onRewindStage: () => void;
  readonly showPlayersPanel?: boolean;
}

export function HostRuntimeSurface({
  pendingHostRuntimeConfirmationCommand,
  pendingHostRuntimeCommand,
  party,
  runtimePanel,
  onAdvanceStage,
  onCancelHostRuntimeConfirmation,
  onConfirmHostRuntimeConfirmation,
  onPauseParty,
  onRequestEndParty,
  onRestartStage,
  onResumeParty,
  onRevealStageResult,
  onRewindParty,
  onRewindStage,
  showPlayersPanel = true,
}: HostRuntimeSurfaceProps) {
  const hostRuntimeControls = useHostRuntimeControls(party);

  return (
    <div data-testid="host-runtime-surface">
      <ContentStack gap="lg">
        <HostPartyStatusBar
          pendingHostRuntimeCommand={pendingHostRuntimeCommand}
          party={party}
          onAdvanceStage={onAdvanceStage}
          onPauseParty={onPauseParty}
          onRequestEndParty={onRequestEndParty}
          onRestartStage={onRestartStage}
          onResumeParty={onResumeParty}
          onRevealStageResult={onRevealStageResult}
          onRewindParty={onRewindParty}
          onRewindStage={onRewindStage}
        />

        {runtimePanel}

        <HostAdvanceStageAction
          controls={hostRuntimeControls}
          onAdvanceStage={onAdvanceStage}
          pendingCommand={pendingHostRuntimeCommand}
        />

        {showPlayersPanel ? <HostPartyPlayersPanel players={party.players} /> : null}

        <HostRuntimeConfirmationDialog
          controls={hostRuntimeControls}
          pendingCommand={pendingHostRuntimeCommand}
          pendingConfirmationCommand={pendingHostRuntimeConfirmationCommand}
          onCancel={onCancelHostRuntimeConfirmation}
          onConfirm={onConfirmHostRuntimeConfirmation}
        />
      </ContentStack>
    </div>
  );
}
