import type { PlayerAnswer } from '../entities/player-answer';

export function calculateAnswerDistribution(answers: PlayerAnswer[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  for (const answer of answers) {
    distribution[answer.answer] = (distribution[answer.answer] || 0) + 1;
  }
  return distribution;
}
