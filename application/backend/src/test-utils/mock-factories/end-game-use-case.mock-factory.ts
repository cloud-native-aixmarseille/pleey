import type { Mocked } from 'vitest';

import type { GameEndingService } from '../../domain/game/ports/services/game-ending.service';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

type EndGameUseCaseLike = Pick<GameEndingService, 'endGame'>;

const END_GAME_USE_CASE_METHOD_KINDS: MockFactoryMethodKinds<EndGameUseCaseLike> = {
  resolved: ['endGame'],
  returned: [],
};

export const createEndGameUseCaseMock = (
  config: MockFactoryConfig<EndGameUseCaseLike> = {},
): Mocked<EndGameUseCaseLike> => {
  const mock: Mocked<EndGameUseCaseLike> = {
    endGame: mockFn<EndGameUseCaseLike['endGame']>(),
  };

  applyMockFactoryConfig(mock, config, END_GAME_USE_CASE_METHOD_KINDS);
  return mock;
};
