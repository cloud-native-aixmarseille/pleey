import type { Mocked } from 'vitest';

import type { PartyPlayerSessionRegistry } from '../../domain/game/party/player/services/party-player-session-registry';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

type PartyPlayerSessionRegistryMockShape = Pick<
  PartyPlayerSessionRegistry,
  'registerSession' | 'hasActiveSession' | 'getActiveSession' | 'invalidateSession' | 'invalidateAllSessions'
>;

const PARTY_PLAYER_SESSION_REGISTRY_METHOD_KINDS: MockFactoryMethodKinds<PartyPlayerSessionRegistryMockShape> = {
  resolved: [],
  returned: ['registerSession', 'hasActiveSession', 'getActiveSession', 'invalidateSession', 'invalidateAllSessions'],
};

export const createPartyPlayerSessionRegistryMock = (
  config: MockFactoryConfig<PartyPlayerSessionRegistryMockShape> = {},
): Mocked<PartyPlayerSessionRegistryMockShape> => {
  const mock: Mocked<PartyPlayerSessionRegistryMockShape> = {
    registerSession: mockFn<PartyPlayerSessionRegistry['registerSession']>().mockImplementation(
      (_partyId, _playerIdentity, sessionId) => ({
        sessionId,
        previousSessionId: null,
      }),
    ),
    hasActiveSession: mockFn<PartyPlayerSessionRegistry['hasActiveSession']>().mockReturnValue(false),
    getActiveSession: mockFn<PartyPlayerSessionRegistry['getActiveSession']>().mockReturnValue(null),
    invalidateSession: mockFn<PartyPlayerSessionRegistry['invalidateSession']>().mockReturnValue(false),
    invalidateAllSessions: mockFn<PartyPlayerSessionRegistry['invalidateAllSessions']>(),
  };

  applyMockFactoryConfig(mock, config, PARTY_PLAYER_SESSION_REGISTRY_METHOD_KINDS);
  return mock;
};
