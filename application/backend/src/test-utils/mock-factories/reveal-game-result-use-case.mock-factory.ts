import type { Mocked } from 'vitest';

import type { ResultRevealService } from '../../domain/game/ports/services/result-reveal.service';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

type RevealGameResultUseCaseLike = Pick<ResultRevealService, 'execute'>;

const REVEAL_GAME_RESULT_USE_CASE_METHOD_KINDS: MockFactoryMethodKinds<RevealGameResultUseCaseLike> =
  {
    resolved: ['execute'],
    returned: [],
  };

export const createRevealGameResultUseCaseMock = (
  config: MockFactoryConfig<RevealGameResultUseCaseLike> = {},
): Mocked<RevealGameResultUseCaseLike> => {
  const mock: Mocked<RevealGameResultUseCaseLike> = {
    execute: mockFn<RevealGameResultUseCaseLike['execute']>(),
  };

  applyMockFactoryConfig(mock, config, REVEAL_GAME_RESULT_USE_CASE_METHOD_KINDS);
  return mock;
};
