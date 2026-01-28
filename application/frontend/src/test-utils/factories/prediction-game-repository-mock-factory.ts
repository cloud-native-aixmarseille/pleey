import { vi } from 'vitest';
import type { PredictionGameRepository } from '../../domains/prediction/ports/prediction-game-repository';

export class PredictionGameRepositoryMockFactory {
  create(overrides: Partial<PredictionGameRepository> = {}): PredictionGameRepository {
    return {
      getPredictionGamesByProject: vi.fn().mockResolvedValue([]),
      createPredictionGame: vi.fn(),
      getPredictionPrompts: vi.fn().mockResolvedValue([]),
      createPredictionPrompt: vi.fn(),
      updatePredictionPrompt: vi.fn(),
      deletePredictionPrompt: vi.fn().mockResolvedValue(undefined),
      ...overrides,
    } as PredictionGameRepository;
  }
}
