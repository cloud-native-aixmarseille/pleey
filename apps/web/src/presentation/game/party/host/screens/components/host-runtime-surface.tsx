import type { ReactNode } from 'react';
import type { HostPartyRuntimeCommand } from '../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import type { PartyObservation } from '../../../../../../domains/game/party/shared/entities/party-observation';
import type { PartyObservationPlayer } from '../../../../../../domains/game/party/shared/entities/party-observation-player';
import { ContentStack } from '../../../../../shared/ui/layout/containers';
import { HostPartyPlayersPanel } from './host-party-players-panel';
import { HostRuntimeConfirmationDialog } from './host-runtime-confirmation-dialog';
import { useHostRuntimeControls } from './use-host-runtime-controls';

interface HostRuntimeSurfaceProps {
  readonly kickPlayer: (player: PartyObservationPlayer) => Promise<void>;
  readonly pendingHostRuntimeConfirmationCommand: HostPartyRuntimeCommand | null;
  readonly pendingHostRuntimeCommand: HostPartyRuntimeCommand | null;
  readonly pendingKickedPlayerKey: string | null;
  readonly party: PartyObservation;
  readonly runtimePanel: ReactNode;
  readonly onCancelHostRuntimeConfirmation: () => void;
  readonly onConfirmHostRuntimeConfirmation: () => void;
  readonly showPlayersPanel?: boolean;
}

export function HostRuntimeSurface({
  kickPlayer,
  pendingHostRuntimeConfirmationCommand,
  pendingHostRuntimeCommand,
  pendingKickedPlayerKey,
  party,
  runtimePanel,
  onCancelHostRuntimeConfirmation,
  onConfirmHostRuntimeConfirmation,
  showPlayersPanel = true,
}: HostRuntimeSurfaceProps) {
  const hostRuntimeControls = useHostRuntimeControls(party);

  return (
    <div data-testid="host-runtime-surface">
      <ContentStack gap="lg">
        {runtimePanel}

        {showPlayersPanel ? (
          <HostPartyPlayersPanel
            onKickPlayer={(player) => void kickPlayer(player)}
            pendingKickedPlayerKey={pendingKickedPlayerKey}
            players={party.players}
          />
        ) : null}

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
