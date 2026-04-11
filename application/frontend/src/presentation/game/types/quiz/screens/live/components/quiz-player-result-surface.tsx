import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { PlayableChoicePlayerResultSurface } from '../../../../shared/screens/live/components/playable-choice-runtime-panels';
import { quizRuntimeCopy } from './quiz-runtime-copy';

interface QuizPlayerResultSurfaceProps {
  readonly onLeaveParty: () => void;
  readonly party: PartyObservation;
}

export function QuizPlayerResultSurface(props: QuizPlayerResultSurfaceProps) {
  return (
    <PlayableChoicePlayerResultSurface {...props} copy={quizRuntimeCopy} testIdPrefix="quiz" />
  );
}
