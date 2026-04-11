import type { ProjectId } from '../../../../project/entities/project';
import type { GameId } from '../../../entities/game';
import type { GameTypeId } from '../../shared/entities/game-type';
import type { Prediction, PredictionId } from '../entities/prediction';

export const PredictionManagementRepositoryProvider = Symbol('PredictionManagementRepository');

export interface CreatePredictionData {
  readonly projectId: ProjectId;
  readonly title: string;
  readonly description: string | null;
}

export interface UpdatePredictionData {
  readonly title: string;
  readonly description: string | null;
}

export interface PredictionManagementRepository {
  create(data: CreatePredictionData): Promise<Prediction>;
  findById(id: GameTypeId): Promise<Prediction | null>;
  update(id: PredictionId, data: UpdatePredictionData): Promise<Prediction>;
  delete(id: PredictionId): Promise<void>;
  hasActiveParty(gameId: GameId): Promise<boolean>;
}
