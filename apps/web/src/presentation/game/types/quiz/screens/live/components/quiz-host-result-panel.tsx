import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { PlayableChoiceHostResultPanel } from '../../../../shared/screens/live/components/playable-choice-runtime-panels';
import { quizRuntimeCopy } from './quiz-runtime-copy';

interface QuizHostResultPanelProps {
  readonly party: PartyObservation;
}

export function QuizHostResultPanel({ party }: QuizHostResultPanelProps) {
  return <PlayableChoiceHostResultPanel copy={quizRuntimeCopy} party={party} testIdPrefix="quiz" />;
}
