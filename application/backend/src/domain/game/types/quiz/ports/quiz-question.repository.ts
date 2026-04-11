import type { SelectableOption } from '../../shared/entities/selectable-option';
import type { QuizId } from '../entities/quiz';
import {
  QuizQuestion,
  type QuizQuestionId,
  type QuizQuestionType,
} from '../entities/quiz-question';

export const QuizQuestionRepositoryProvider = Symbol('QuizQuestionRepository');

export interface QuizQuestionMutationData {
  readonly position?: number;
  readonly questionText: string;
  readonly type: QuizQuestionType;
  readonly timeLimit: number;
  readonly points: number;
  readonly answers: readonly SelectableOption[];
}

export interface QuizQuestionRepository {
  create(quizId: QuizId, data: QuizQuestionMutationData): Promise<QuizQuestion>;
  findById(id: QuizQuestionId): Promise<QuizQuestion | null>;
  findByQuizId(quizId: QuizId): Promise<QuizQuestion[]>;
  update(id: QuizQuestionId, data: QuizQuestionMutationData): Promise<QuizQuestion>;
  delete(id: QuizQuestionId): Promise<void>;
}
