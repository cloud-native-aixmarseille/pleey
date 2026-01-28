import type { Mocked } from 'vitest';

import type { GameBroadcastService } from '../../domain/game/ports/services/game-broadcast.service';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const GAME_BROADCAST_SERVICE_METHOD_KINDS: MockFactoryMethodKinds<GameBroadcastService> = {
  resolved: [],
  returned: ['publish'],
};

export const createGameBroadcastServiceMock = (
  config: MockFactoryConfig<GameBroadcastService> = {},
): Mocked<GameBroadcastService> => {
  const mock: Mocked<GameBroadcastService> = {
    publish: mockFn<GameBroadcastService['publish']>(),
  };

  applyMockFactoryConfig(mock, config, GAME_BROADCAST_SERVICE_METHOD_KINDS);
  return mock;
};
