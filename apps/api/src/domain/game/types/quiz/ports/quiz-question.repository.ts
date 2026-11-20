import type { SelectableOption } from '@pleey/contracts/game';
import type { PaginatedResult, PaginationQuery } from '@pleey/contracts/shared/primitives';
import type { StoredMediaAsset } from '../../../../media/entities/stored-media-asset';
import type { QuizId } from '../entities/quiz';
import { QuizQuestion, type QuizQuestionId, type QuizQuestionType } from '../entities/quiz-question';

export const QuizQuestionRepositoryProvider = Symbol('QuizQuestionRepository');

export interface QuizQuestionCreationData {
  readonly questionText: string;
  readonly type: QuizQuestionType;
  readonly timeLimit: number;
  readonly points: number;
  readonly answers: readonly SelectableOption[];
  readonly media?: StoredMediaAsset | null;
}

export interface QuizQuestionMutationData extends QuizQuestionCreationData {
  readonly position?: number;
}

export interface QuizQuestionRepository {
  create(quizId: QuizId, data: QuizQuestionMutationData): Promise<QuizQuestion>;
  findByMediaAssetId(assetId: string): Promise<QuizQuestion | null>;
  findById(id: QuizQuestionId): Promise<QuizQuestion | null>;
  findByQuizId(quizId: QuizId, query: PaginationQuery): Promise<PaginatedResult<QuizQuestion>>;
  update(id: QuizQuestionId, data: QuizQuestionMutationData): Promise<QuizQuestion>;
  delete(id: QuizQuestionId): Promise<void>;
}
