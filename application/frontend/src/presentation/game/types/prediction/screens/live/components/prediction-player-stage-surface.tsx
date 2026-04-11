import type { PartyActionId } from '../../../../../../../domains/game/party/shared/entities/party-action';
import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { PlayableChoicePlayerStageSurface } from '../../../../shared/screens/live/components/playable-choice-runtime-panels';
import { predictionRuntimeCopy } from './prediction-runtime-copy';

interface PredictionPlayerStageSurfaceProps {
  readonly onLeaveParty: () => void;
  readonly onSubmitAction: (actionId: PartyActionId) => void;
  readonly party: PartyObservation;
  readonly pendingActionId: PartyActionId | null;
  readonly playerActionErrorMessage: string | null;
}

export function PredictionPlayerStageSurface(props: PredictionPlayerStageSurfaceProps) {
  return (
    <PlayableChoicePlayerStageSurface
      {...props}
      copy={predictionRuntimeCopy}
      testIdPrefix="prediction"
    />
  );
}
