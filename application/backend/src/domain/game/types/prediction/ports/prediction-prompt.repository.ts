import type { PaginatedResult } from '../../../../shared/value-objects/paginated-result';
import type { PaginationQuery } from '../../../../shared/value-objects/pagination-query';
import type { SelectableOption } from '../../shared/entities/selectable-option';
import type { PredictionId } from '../entities/prediction';
import { PredictionPrompt, type PredictionPromptId } from '../entities/prediction-prompt';

export const PredictionPromptRepositoryProvider = Symbol('PredictionPromptRepository');

export interface PredictionPromptCreationData {
  readonly promptText: string;
  readonly timeLimit: number;
  readonly points: number;
  readonly options: readonly SelectableOption[];
}

export interface PredictionPromptMutationData extends PredictionPromptCreationData {
  readonly position?: number;
}

export interface PredictionPromptRepository {
  create(predictionId: PredictionId, data: PredictionPromptMutationData): Promise<PredictionPrompt>;
  findById(id: PredictionPromptId): Promise<PredictionPrompt | null>;
  findByPredictionId(predictionId: PredictionId, query: PaginationQuery): Promise<PaginatedResult<PredictionPrompt>>;
  update(id: PredictionPromptId, data: PredictionPromptMutationData): Promise<PredictionPrompt>;
  delete(id: PredictionPromptId): Promise<void>;
}
