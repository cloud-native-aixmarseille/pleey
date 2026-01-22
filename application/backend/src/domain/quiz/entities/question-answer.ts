import type { QuestionId } from './question';

export type QuestionAnswerId = number;

/**
 * QuestionAnswer Domain Entity
 * Represents a single answer option for a question
 */
export class QuestionAnswer {
  constructor(
    public readonly id: QuestionAnswerId,
    public readonly questionId: QuestionId,
    public readonly text: string | null,
    public readonly position: number,
    public readonly isCorrect: boolean,
  ) {}
}
