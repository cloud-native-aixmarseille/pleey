import type { PlayableChoicePlayerStageSurfaceProps } from '../../../../shared/screens/live/components/playable-choice-runtime-panel.types';
import { PlayableChoicePlayerStageSurface } from '../../../../shared/screens/live/components/playable-choice-runtime-panels';
import { predictionRuntimeCopy } from './prediction-runtime-copy';

type PredictionPlayerStageSurfaceProps = Omit<PlayableChoicePlayerStageSurfaceProps, 'copy' | 'testIdPrefix'>;

export function PredictionPlayerStageSurface(props: PredictionPlayerStageSurfaceProps) {
  return <PlayableChoicePlayerStageSurface {...props} copy={predictionRuntimeCopy} testIdPrefix="prediction" />;
}
