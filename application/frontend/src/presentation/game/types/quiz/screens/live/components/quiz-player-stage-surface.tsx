import type { PlayableChoicePlayerStageSurfaceProps } from '../../../../shared/screens/live/components/playable-choice-runtime-panel.types';
import { PlayableChoicePlayerStageSurface } from '../../../../shared/screens/live/components/playable-choice-runtime-panels';
import { quizRuntimeCopy } from './quiz-runtime-copy';

type QuizPlayerStageSurfaceProps = Omit<PlayableChoicePlayerStageSurfaceProps, 'copy' | 'testIdPrefix'>;

export function QuizPlayerStageSurface(props: QuizPlayerStageSurfaceProps) {
  return (
    <PlayableChoicePlayerStageSurface
      key={props.party.context?.lifecycle.stageId ?? 'no-stage'}
      {...props}
      copy={quizRuntimeCopy}
      testIdPrefix="quiz"
    />
  );
}
