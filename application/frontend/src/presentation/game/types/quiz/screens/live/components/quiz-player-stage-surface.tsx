import type { PartyActionId } from '../../../../../../../domains/game/party/shared/entities/party-action';
import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { PlayableChoicePlayerStageSurface } from '../../../../shared/screens/live/components/playable-choice-runtime-panels';
import { quizRuntimeCopy } from './quiz-runtime-copy';

interface QuizPlayerStageSurfaceProps {
  readonly onLeaveParty: () => void;
  readonly onSubmitAction: (actionId: PartyActionId) => void;
  readonly party: PartyObservation;
  readonly pendingActionId: PartyActionId | null;
  readonly playerActionErrorMessage: string | null;
}

export function QuizPlayerStageSurface(props: QuizPlayerStageSurfaceProps) {
  return <PlayableChoicePlayerStageSurface {...props} copy={quizRuntimeCopy} testIdPrefix="quiz" />;
}
