import type { PlayableChoiceRuntimeCopy } from '../../../../shared/screens/live/components/playable-choice-runtime-panels';

export const quizRuntimeCopy = {
  actionSlotLabel: 'game.types.quiz.runtime.actionSlotLabel',
  correctBadge: 'game.types.quiz.runtime.correctBadge',
  paused: 'game.types.quiz.runtime.paused',
  pointsAwarded: 'game.types.quiz.runtime.pointsAwarded',
  responseLocked: 'game.types.quiz.runtime.responseLocked',
  resultCorrect: 'game.types.quiz.runtime.resultCorrect',
  resultHeading: 'game.types.quiz.runtime.resultHeading',
  resultIncorrect: 'game.types.quiz.runtime.resultIncorrect',
  resultIncorrectHint: 'game.types.quiz.runtime.resultIncorrectHint',
  resultNoAnswer: 'game.types.quiz.runtime.resultNoAnswer',
  resultNoAnswerHint: 'game.types.quiz.runtime.resultNoAnswerHint',
  voteCount: 'game.types.quiz.runtime.voteCount',
  yourPickBadge: 'game.types.quiz.runtime.yourPickBadge',
} as const satisfies PlayableChoiceRuntimeCopy;
