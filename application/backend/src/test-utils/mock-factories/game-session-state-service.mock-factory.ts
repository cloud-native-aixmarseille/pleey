import type { Mocked } from 'vitest';

import type { GameSessionStateService } from '../../domain/game/services/game-session-state.service';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

type GameSessionStateServiceLike = Pick<
  GameSessionStateService,
  'findPinBySocketId' | 'get' | 'getOrCreate' | 'remove' | 'update'
>;

const GAME_SESSION_STATE_SERVICE_METHOD_KINDS: MockFactoryMethodKinds<GameSessionStateServiceLike> =
  {
    resolved: ['findPinBySocketId', 'get', 'getOrCreate', 'remove', 'update'],
    returned: [],
  };

export const createGameSessionStateServiceMock = (
  config: MockFactoryConfig<GameSessionStateServiceLike> = {},
): Mocked<GameSessionStateServiceLike> => {
  const mock: Mocked<GameSessionStateServiceLike> = {
    findPinBySocketId: mockFn<GameSessionStateServiceLike['findPinBySocketId']>(),
    get: mockFn<GameSessionStateServiceLike['get']>(),
    getOrCreate: mockFn<GameSessionStateServiceLike['getOrCreate']>(),
    remove: mockFn<GameSessionStateServiceLike['remove']>(),
    update: mockFn<GameSessionStateServiceLike['update']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_SESSION_STATE_SERVICE_METHOD_KINDS);
  return mock;
};
