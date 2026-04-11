import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { ContentStack } from '../../../../../../shared/ui/layout/containers';
import { PartyFinalSummaryPanel } from '../../../../shared/screens/pin/components/party-final-summary-panel';
import { PlayerPartyStatusBar } from './player-party-status-bar';

interface PlayerFinalSurfaceProps {
  readonly onLeaveParty: () => void;
  readonly party: PartyObservation;
}

export function PlayerFinalSurface({ onLeaveParty, party }: PlayerFinalSurfaceProps) {
  return (
    <div data-testid="player-final-surface">
      <ContentStack gap="lg">
        <PlayerPartyStatusBar onLeaveParty={onLeaveParty} party={party} variant="final" />

        <PartyFinalSummaryPanel players={party.players} />
      </ContentStack>
    </div>
  );
}
