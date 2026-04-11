import type { PlayableChoiceRuntimeCopy } from '../../../../shared/screens/live/components/playable-choice-runtime-panels';

export const predictionRuntimeCopy = {
  actionSlotLabel: 'game.types.prediction.runtime.actionSlotLabel',
  correctBadge: 'game.types.prediction.runtime.correctBadge',
  paused: 'game.types.prediction.runtime.paused',
  pointsAwarded: 'game.types.prediction.runtime.pointsAwarded',
  responseLocked: 'game.types.prediction.runtime.responseLocked',
  resultCorrect: 'game.types.prediction.runtime.resultCorrect',
  resultHeading: 'game.types.prediction.runtime.resultHeading',
  resultIncorrect: 'game.types.prediction.runtime.resultIncorrect',
  resultIncorrectHint: 'game.types.prediction.runtime.resultIncorrectHint',
  submissionProgress: 'game.types.prediction.runtime.submissionProgress',
  voteCount: 'game.types.prediction.runtime.voteCount',
  yourPickBadge: 'game.types.prediction.runtime.yourPickBadge',
} as const satisfies PlayableChoiceRuntimeCopy;
