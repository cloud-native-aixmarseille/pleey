import type { Mocked } from 'vitest';
import type { PlayerPartyRuntimePort } from '../../application/game/party/player/ports/player-party-runtime.port';
import { UserIdentifier } from '../../application/identity/shared/services/identifiers/user-identifier';
import { PartyPlayerKind } from '../../domain/game/party/enums/party-player-kind.enum';
import { mockFn } from './mock-factory.utils';

const userIdentifier = new UserIdentifier();

type PlayerPartyRuntimeLike = Pick<
  PlayerPartyRuntimePort,
  | 'ensureAuthenticatedPlayer'
  | 'ensureGuestPlayer'
  | 'findActivePartyByUserId'
  | 'findPartyByPin'
  | 'findPartyPlayer'
  | 'removePlayer'
>;

type ActivePlayerPartySessionInput = {
  readonly partyId: number;
  readonly gameId: number;
  readonly pin: string;
  readonly status: 'WAITING' | 'ACTIVE' | 'PAUSED' | 'ENDED';
};

type PartyJoinTargetInput = ActivePlayerPartySessionInput & {
  readonly hostUserId: number;
};

type CreatePlayerPartyRuntimeMockConfig = {
  readonly ensureAuthenticatedPlayer?: undefined;
  readonly ensureGuestPlayer?: {
    readonly guestId: string;
  };
  readonly findActivePartyByUserId?: ActivePlayerPartySessionInput | null;
  readonly findPartyByPin?: PartyJoinTargetInput | null;
  readonly findPartyPlayer?: {
    readonly avatarUri: string | null;
    readonly identity:
      | {
          readonly kind: PartyPlayerKind.USER;
          readonly userId: number;
        }
      | {
          readonly kind: PartyPlayerKind.GUEST;
          readonly guestId: string;
        };
    readonly joinedAt: Date;
    readonly totalScore: number;
    readonly username: string;
  } | null;
  readonly removePlayer?: boolean;
};

const DEFAULT_PARTY_JOIN_TARGET: PartyJoinTargetInput = {
  partyId: 12,
  gameId: 21,
  hostUserId: 7,
  pin: '123456',
  status: 'WAITING',
};

const DEFAULT_GUEST_PLAYER_IDENTITY = {
  kind: PartyPlayerKind.GUEST,
  guestId: 'guest-42',
};

const DEFAULT_PARTY_PLAYER = {
  avatarUri: '/api/avatars/users/42?v=1',
  identity: {
    kind: PartyPlayerKind.USER,
    userId: userIdentifier.parse(42),
  },
  joinedAt: new Date('2026-04-27T10:00:00.000Z'),
  totalScore: 0,
  username: 'Morgan',
};

export const createPlayerPartyRuntimeMock = (
  config: CreatePlayerPartyRuntimeMockConfig = {},
): Mocked<PlayerPartyRuntimeLike> => {
  const mock: Mocked<PlayerPartyRuntimeLike> = {
    ensureAuthenticatedPlayer: mockFn<PlayerPartyRuntimeLike['ensureAuthenticatedPlayer']>(),
    ensureGuestPlayer: mockFn<PlayerPartyRuntimeLike['ensureGuestPlayer']>(),
    findActivePartyByUserId: mockFn<PlayerPartyRuntimeLike['findActivePartyByUserId']>(),
    findPartyByPin: mockFn<PlayerPartyRuntimeLike['findPartyByPin']>(),
    findPartyPlayer: mockFn<PlayerPartyRuntimeLike['findPartyPlayer']>(),
    removePlayer: mockFn<PlayerPartyRuntimeLike['removePlayer']>(),
  };

  mock.ensureAuthenticatedPlayer.mockResolvedValue(config.ensureAuthenticatedPlayer);
  mock.ensureGuestPlayer.mockResolvedValue(
    (config.ensureGuestPlayer ?? DEFAULT_GUEST_PLAYER_IDENTITY) as Awaited<
      ReturnType<PlayerPartyRuntimeLike['ensureGuestPlayer']>
    >,
  );
  mock.findActivePartyByUserId.mockResolvedValue(
    (config.findActivePartyByUserId === undefined
      ? null
      : config.findActivePartyByUserId) as Awaited<
      ReturnType<PlayerPartyRuntimeLike['findActivePartyByUserId']>
    >,
  );
  mock.findPartyByPin.mockResolvedValue(
    (config.findPartyByPin === undefined
      ? DEFAULT_PARTY_JOIN_TARGET
      : config.findPartyByPin) as Awaited<ReturnType<PlayerPartyRuntimeLike['findPartyByPin']>>,
  );
  mock.findPartyPlayer.mockResolvedValue(
    (config.findPartyPlayer === undefined
      ? DEFAULT_PARTY_PLAYER
      : config.findPartyPlayer) as Awaited<ReturnType<PlayerPartyRuntimeLike['findPartyPlayer']>>,
  );
  mock.removePlayer.mockResolvedValue(config.removePlayer ?? false);

  return mock;
};
