import type { Mocked } from 'vitest';

import type { GameSessionPinContextService } from '../../application/game-session/live/shared/services/game-session-pin-context-service';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

type GameSessionPinContextServiceLike = Pick<GameSessionPinContextService, 'load' | 'loadExisting'>;

const GAME_SESSION_PIN_CONTEXT_SERVICE_METHOD_KINDS: MockFactoryMethodKinds<GameSessionPinContextServiceLike> =
  {
    resolved: ['load', 'loadExisting'],
    returned: [],
  };

export const createGameSessionPinContextServiceMock = (
  config: MockFactoryConfig<GameSessionPinContextServiceLike> = {},
): Mocked<GameSessionPinContextServiceLike> => {
  const mock: Mocked<GameSessionPinContextServiceLike> = {
    load: mockFn<GameSessionPinContextServiceLike['load']>(),
    loadExisting: mockFn<GameSessionPinContextServiceLike['loadExisting']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_SESSION_PIN_CONTEXT_SERVICE_METHOD_KINDS);
  return mock;
};
