import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { PlayableChoiceHostStagePanel } from '../../../../shared/screens/live/components/playable-choice-runtime-panels';
import { predictionRuntimeCopy } from './prediction-runtime-copy';

interface PredictionHostStagePanelProps {
  readonly party: PartyObservation;
}

export function PredictionHostStagePanel({ party }: PredictionHostStagePanelProps) {
  return (
    <PlayableChoiceHostStagePanel
      copy={predictionRuntimeCopy}
      party={party}
      testIdPrefix="prediction"
    />
  );
}
