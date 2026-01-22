import type { Mocked } from 'vitest';

import type { EndGameUseCase } from '../../application/game/use-cases/end-game.use-case';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

type EndGameUseCaseLike = Pick<EndGameUseCase, 'execute' | 'endGame'>;

const END_GAME_USE_CASE_METHOD_KINDS: MockFactoryMethodKinds<EndGameUseCaseLike> = {
  resolved: ['execute', 'endGame'],
  returned: [],
};

export const createEndGameUseCaseMock = (
  config: MockFactoryConfig<EndGameUseCaseLike> = {},
): Mocked<EndGameUseCaseLike> => {
  const mock: Mocked<EndGameUseCaseLike> = {
    execute: mockFn<EndGameUseCaseLike['execute']>(),
    endGame: mockFn<EndGameUseCaseLike['endGame']>(),
  };

  applyMockFactoryConfig(mock, config, END_GAME_USE_CASE_METHOD_KINDS);
  return mock;
};
