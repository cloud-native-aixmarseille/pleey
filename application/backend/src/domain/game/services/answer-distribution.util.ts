import type { QuestionAnswerId } from '../../quiz/entities/question-answer';
import type { PlayerAnswer } from '../entities/player-answer';

export function calculateAnswerDistribution(
  answers: PlayerAnswer[],
): Record<QuestionAnswerId, number> {
  const distribution: Record<QuestionAnswerId, number> = {};
  for (const answer of answers) {
    distribution[answer.answerId] = (distribution[answer.answerId] || 0) + 1;
  }
  return distribution;
}
