import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { PlayableChoiceHostStagePanel } from '../../../../shared/screens/live/components/playable-choice-runtime-panels';
import { quizRuntimeCopy } from './quiz-runtime-copy';

interface QuizHostStagePanelProps {
  readonly party: PartyObservation;
}

export function QuizHostStagePanel({ party }: QuizHostStagePanelProps) {
  return <PlayableChoiceHostStagePanel copy={quizRuntimeCopy} party={party} testIdPrefix="quiz" />;
}
