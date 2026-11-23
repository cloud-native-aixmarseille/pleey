import { DEFAULT_PARTY_SETTINGS, PartyPlayerKind } from '@pleey/contracts/party';
import type { Mocked } from 'vitest';
import type { PlayerPartyRuntimePort } from '../../application/game/party/player/ports/player-party-runtime.port';
import { backendTestIdentifiers } from '../branded-identifiers';
import { mockFn } from './mock-factory.utils';

type PlayerPartyRuntimeLike = Pick<
  PlayerPartyRuntimePort,
  'ensureAuthenticatedPlayer' | 'findActivePartyByUserId' | 'findPartyByPin' | 'findPartyPlayer' | 'removePlayer'
>;

type ActivePlayerPartySessionInput = {
  readonly partyId: ReturnType<typeof backendTestIdentifiers.party>;
  readonly gameId: ReturnType<typeof backendTestIdentifiers.game>;
  readonly pin: string;
  readonly status: 'WAITING' | 'ACTIVE' | 'PAUSED' | 'ENDED';
};

type PartyJoinTargetInput = ActivePlayerPartySessionInput & {
  readonly hostUserId: ReturnType<typeof backendTestIdentifiers.user>;
  readonly privatePartyPasswordHash: string | null;
  readonly settings: {
    readonly allowJoiningAfterStart: boolean;
    readonly allowOptionChangeAfterVoting: boolean;
    readonly randomizeOptionOrder: boolean;
    readonly randomizeStageOrder: boolean;
  };
};

type CreatePlayerPartyRuntimeMockConfig = {
  readonly ensureAuthenticatedPlayer?: undefined;
  readonly findActivePartyByUserId?: Partial<ActivePlayerPartySessionInput> | null;
  readonly findPartyByPin?: Partial<PartyJoinTargetInput> | null;
  readonly findPartyPlayer?: Awaited<ReturnType<PlayerPartyRuntimeLike['findPartyPlayer']>>;
  readonly removePlayer?: boolean;
};

export const DEFAULT_PARTY_JOIN_TARGET: PartyJoinTargetInput = {
  partyId: backendTestIdentifiers.party(12),
  gameId: backendTestIdentifiers.game(21),
  hostUserId: backendTestIdentifiers.user(7),
  privatePartyPasswordHash: null,
  pin: '123456',
  settings: DEFAULT_PARTY_SETTINGS,
  status: 'WAITING',
};

const DEFAULT_ACTIVE_PARTY_SESSION: ActivePlayerPartySessionInput = {
  partyId: backendTestIdentifiers.party(12),
  gameId: backendTestIdentifiers.game(21),
  pin: '123456',
  status: 'WAITING',
};

const DEFAULT_PARTY_PLAYER = {
  avatarUri: '/api/avatars/users/42?v=1',
  identity: {
    kind: PartyPlayerKind.USER,
    userId: backendTestIdentifiers.user(42),
  },
  joinedAt: new Date('2026-04-27T10:00:00.000Z'),
  totalScore: 0,
  username: 'Morgan',
} satisfies NonNullable<CreatePlayerPartyRuntimeMockConfig['findPartyPlayer']>;

export const createPlayerPartyRuntimeMock = (
  config: CreatePlayerPartyRuntimeMockConfig = {},
): Mocked<PlayerPartyRuntimeLike> => {
  const mock: Mocked<PlayerPartyRuntimeLike> = {
    ensureAuthenticatedPlayer: mockFn<PlayerPartyRuntimeLike['ensureAuthenticatedPlayer']>(),
    findActivePartyByUserId: mockFn<PlayerPartyRuntimeLike['findActivePartyByUserId']>(),
    findPartyByPin: mockFn<PlayerPartyRuntimeLike['findPartyByPin']>(),
    findPartyPlayer: mockFn<PlayerPartyRuntimeLike['findPartyPlayer']>(),
    removePlayer: mockFn<PlayerPartyRuntimeLike['removePlayer']>(),
  };

  mock.ensureAuthenticatedPlayer.mockResolvedValue(config.ensureAuthenticatedPlayer);
  mock.findActivePartyByUserId.mockResolvedValue(
    (config.findActivePartyByUserId === undefined
      ? null
      : config.findActivePartyByUserId === null
        ? null
        : { ...DEFAULT_ACTIVE_PARTY_SESSION, ...config.findActivePartyByUserId }) as Awaited<
      ReturnType<PlayerPartyRuntimeLike['findActivePartyByUserId']>
    >,
  );
  mock.findPartyByPin.mockResolvedValue(
    (config.findPartyByPin === undefined
      ? DEFAULT_PARTY_JOIN_TARGET
      : config.findPartyByPin === null
        ? null
        : { ...DEFAULT_PARTY_JOIN_TARGET, ...config.findPartyByPin }) as Awaited<
      ReturnType<PlayerPartyRuntimeLike['findPartyByPin']>
    >,
  );
  mock.findPartyPlayer.mockResolvedValue(
    (config.findPartyPlayer === undefined ? DEFAULT_PARTY_PLAYER : config.findPartyPlayer) as Awaited<
      ReturnType<PlayerPartyRuntimeLike['findPartyPlayer']>
    >,
  );
  mock.removePlayer.mockResolvedValue(config.removePlayer ?? false);

  return mock;
};
