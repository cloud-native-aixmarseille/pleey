import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { PlayableChoicePlayerResultSurface } from '../../../../shared/screens/live/components/playable-choice-runtime-panels';
import { predictionRuntimeCopy } from './prediction-runtime-copy';

interface PredictionPlayerResultSurfaceProps {
  readonly onLeaveParty: () => void;
  readonly party: PartyObservation;
}

export function PredictionPlayerResultSurface(props: PredictionPlayerResultSurfaceProps) {
  return (
    <PlayableChoicePlayerResultSurface
      {...props}
      copy={predictionRuntimeCopy}
      testIdPrefix="prediction"
    />
  );
}
