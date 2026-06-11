import { PartyIdentifier } from '../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GameIdentifier } from '../../application/game/shared/services/identifiers/game-identifier';
import { GuestIdentifier } from '../../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../../application/identity/shared/services/identifiers/user-identifier';
import type { GameId } from '../../domains/game/entities/game';
import type { Party, PartyId, PartyPin } from '../../domains/game/party/shared/entities/party';
import type { PartyHost } from '../../domains/game/party/shared/entities/party-host';
import type { PartyObservation } from '../../domains/game/party/shared/entities/party-observation';
import type { PartyObservationPlayer } from '../../domains/game/party/shared/entities/party-observation-player';
import {
  type PartyPlayerIdentity,
  PartyPlayerIdentityKind,
} from '../../domains/game/party/shared/entities/party-player-identity';
import { PartyRole } from '../../domains/game/party/shared/entities/party-role';
import { PartyStatus } from '../../domains/game/party/shared/entities/party-status';
import { GameType } from '../../domains/game/types/shared/game-type';
import type { GuestId } from '../../domains/identity/entities/guest';
import type { UserId } from '../../domains/identity/entities/user';
import { coerceUuidV7TestValue } from './uuid-v7-test-value';

const gameIdentifier = new GameIdentifier();
const partyIdentifier = new PartyIdentifier();
const partyPinIdentifier = new PartyPinIdentifier();
const guestIdentifier = new GuestIdentifier();
const userIdentifier = new UserIdentifier();

interface PartyOverrides extends Omit<Partial<Party>, 'partyId' | 'gameId' | 'pin'> {
  readonly partyId?: number | PartyId;
  readonly gameId?: number | GameId;
  readonly pin?: string | PartyPin;
}

type IdentityOverride =
  | {
      readonly kind: PartyPlayerIdentityKind.User;
      readonly userId: number | UserId;
    }
  | {
      readonly kind: PartyPlayerIdentityKind.Guest;
      readonly guestId: string | GuestId;
    };

type PartyHostOverrides = {
  readonly avatarUri?: string | null;
  readonly username?: string;
};

interface PartyObservationOverrides
  extends Omit<Partial<PartyObservation>, 'partyId' | 'pin' | 'host' | 'players'> {
  readonly partyId?: number | PartyId;
  readonly pin?: string | PartyPin;
  readonly host?: PartyHost;
  readonly players?: readonly PartyObservationPlayer[];
}

type PartyObservationPlayerOverrides = {
  readonly avatarUri?: string | null;
  readonly correctStages?: number;
  readonly identity?: IdentityOverride;
  readonly isCurrentPlayer?: boolean;
  readonly isLive?: boolean;
  readonly totalScore?: number;
  readonly username?: string;
};

export class PartyFixtureFactory {
  createParty(overrides: PartyOverrides = {}): Party {
    const { partyId, gameId, pin, ...restOverrides } = overrides;

    return {
      partyId:
        partyId === undefined
          ? partyIdentifier.parse(coerceUuidV7TestValue(1))
          : typeof partyId === 'number'
            ? partyIdentifier.parse(coerceUuidV7TestValue(partyId))
            : partyId,
      gameId:
        gameId === undefined
          ? gameIdentifier.parse(coerceUuidV7TestValue(17))
          : typeof gameId === 'number'
            ? gameIdentifier.parse(coerceUuidV7TestValue(gameId))
            : gameId,
      pin: pin === undefined ? partyPinIdentifier.parse('AB12CD') : partyPinIdentifier.parse(pin),
      status: PartyStatus.WAITING,
      role: PartyRole.HOST,
      createdAt: '2026-04-22T10:00:00.000Z',
      ...restOverrides,
    };
  }

  createHost(overrides: PartyHostOverrides = {}): PartyHost {
    return {
      avatarUri: overrides.avatarUri ?? '/avatars/host.png',
      username: overrides.username ?? 'Host',
    };
  }

  createObservationPlayer(overrides: PartyObservationPlayerOverrides = {}): PartyObservationPlayer {
    const normalizedIdentity = this.normalizeIdentity(
      overrides.identity ?? {
        kind: PartyPlayerIdentityKind.User,
        userId: userIdentifier.parse(coerceUuidV7TestValue(11)),
      },
    );

    return {
      avatarUri: overrides.avatarUri ?? '/avatars/player.png',
      correctStages: overrides.correctStages ?? 0,
      identity: normalizedIdentity,
      isCurrentPlayer: overrides.isCurrentPlayer ?? false,
      isLive: overrides.isLive ?? true,
      totalScore: overrides.totalScore ?? 0,
      username: overrides.username ?? 'Neo',
    };
  }

  createPartyObservation(overrides: PartyObservationOverrides = {}): PartyObservation {
    const { partyId, pin, host, players, ...restOverrides } = overrides;

    return {
      partyId:
        partyId === undefined
          ? partyIdentifier.parse(coerceUuidV7TestValue(9))
          : typeof partyId === 'number'
            ? partyIdentifier.parse(coerceUuidV7TestValue(partyId))
            : partyId,
      gameType: GameType.Quiz,
      pin: pin === undefined ? partyPinIdentifier.parse('AB12CD') : partyPinIdentifier.parse(pin),
      status: PartyStatus.WAITING,
      context: null,
      isObserverHost: false,
      host: host ?? this.createHost(),
      players: players ?? [
        this.createObservationPlayer({
          identity: {
            kind: PartyPlayerIdentityKind.User,
            userId: userIdentifier.parse(coerceUuidV7TestValue(11)),
          },
          isCurrentPlayer: true,
          isLive: true,
          username: 'Neo',
        }),
      ],
      ...restOverrides,
    };
  }

  private normalizeIdentity(identity: IdentityOverride): PartyPlayerIdentity {
    return identity.kind === PartyPlayerIdentityKind.User
      ? {
          kind: PartyPlayerIdentityKind.User,
          userId:
            typeof identity.userId === 'number'
              ? userIdentifier.parse(coerceUuidV7TestValue(identity.userId))
              : identity.userId,
        }
      : {
          kind: PartyPlayerIdentityKind.Guest,
          guestId: guestIdentifier.parse(coerceUuidV7TestValue(identity.guestId)),
        };
  }
}
