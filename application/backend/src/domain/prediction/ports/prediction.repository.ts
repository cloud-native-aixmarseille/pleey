import type { GameId } from '../../game/entities/game';
import type { Prediction, PredictionId } from '../entities/prediction';

export const PredictionRepositoryProvider = Symbol('PredictionRepository');

export interface PredictionRepository {
  create(gameId: GameId): Promise<Prediction>;
  findById(id: PredictionId): Promise<Prediction | null>;
  findByGameId(gameId: GameId): Promise<Prediction | null>;
}
