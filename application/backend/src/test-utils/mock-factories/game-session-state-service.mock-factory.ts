import type { Mocked } from 'vitest';

import type { GameSessionStateService } from '../../domain/game/services/game-session-state-service';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

type GameSessionStateServiceLike = Pick<
  GameSessionStateService,
  | 'findPinBySocketId'
  | 'findPinByUserId'
  | 'get'
  | 'getOrCreate'
  | 'remove'
  | 'removePinByUserId'
  | 'removePinsBySession'
  | 'savePinByUserId'
  | 'update'
>;

const GAME_SESSION_STATE_SERVICE_METHOD_KINDS: MockFactoryMethodKinds<GameSessionStateServiceLike> =
  {
    resolved: [
      'findPinBySocketId',
      'findPinByUserId',
      'get',
      'getOrCreate',
      'remove',
      'removePinByUserId',
      'removePinsBySession',
      'savePinByUserId',
      'update',
    ],
    returned: [],
  };

export const createGameSessionStateServiceMock = (
  config: MockFactoryConfig<GameSessionStateServiceLike> = {},
): Mocked<GameSessionStateServiceLike> => {
  const mock: Mocked<GameSessionStateServiceLike> = {
    findPinBySocketId: mockFn<GameSessionStateServiceLike['findPinBySocketId']>(),
    findPinByUserId: mockFn<GameSessionStateServiceLike['findPinByUserId']>(),
    get: mockFn<GameSessionStateServiceLike['get']>(),
    getOrCreate: mockFn<GameSessionStateServiceLike['getOrCreate']>(),
    remove: mockFn<GameSessionStateServiceLike['remove']>(),
    removePinByUserId: mockFn<GameSessionStateServiceLike['removePinByUserId']>(),
    removePinsBySession: mockFn<GameSessionStateServiceLike['removePinsBySession']>(),
    savePinByUserId: mockFn<GameSessionStateServiceLike['savePinByUserId']>(),
    update: mockFn<GameSessionStateServiceLike['update']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_SESSION_STATE_SERVICE_METHOD_KINDS);
  return mock;
};
