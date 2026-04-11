import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { PlayableChoiceHostResultPanel } from '../../../../shared/screens/live/components/playable-choice-runtime-panels';
import { predictionRuntimeCopy } from './prediction-runtime-copy';

interface PredictionHostResultPanelProps {
  readonly party: PartyObservation;
}

export function PredictionHostResultPanel({ party }: PredictionHostResultPanelProps) {
  return (
    <PlayableChoiceHostResultPanel
      copy={predictionRuntimeCopy}
      party={party}
      testIdPrefix="prediction"
    />
  );
}
