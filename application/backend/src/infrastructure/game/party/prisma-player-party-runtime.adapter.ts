import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import {
  type ActivePlayerPartySession,
  type EnsureAuthenticatedPlayerCommand,
  type EnsureGuestPlayerCommand,
  type FindPartyPlayerCommand,
  type PartyJoinTarget,
  PlayerPartyRuntimePort,
  type RemovePartyPlayerCommand,
} from '../../../application/game/party/player/ports/player-party-runtime.port';
import { PartyIdentifier } from '../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GameIdentifier } from '../../../application/game/shared/services/identifiers/game-identifier';
import { GuestIdentifier } from '../../../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../../../application/identity/shared/services/identifiers/user-identifier';
import { PartyPlayerKind } from '../../../domain/game/party/enums/party-player-kind.enum';
import type { GuestPartyPlayerIdentity } from '../../../domain/game/party/player/entities/party-player-identity';
import type { PartyPin } from '../../../domain/game/party/shared/entities/party';
import type { GuestRepository } from '../../../domain/identity/ports/guest.repository';
import { GuestRepositoryProvider } from '../../../domain/identity/ports/guest.repository';
import { PrismaService } from '../../database/prisma-service';
import { PrismaPartyReadModelMapper } from './services/prisma-party-read-model-mapper';

const ACTIVE_PARTY_STATUSES = ['waiting', 'active', 'paused'] as const;

@Injectable()
export class PrismaPlayerPartyRuntimeAdapter extends PlayerPartyRuntimePort {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(GuestRepositoryProvider)
    private readonly guestRepository: GuestRepository,
    private readonly gameIdentifier: GameIdentifier,
    private readonly guestIdentifier: GuestIdentifier,
    private readonly partyReadModelMapper: PrismaPartyReadModelMapper,
    private readonly partyIdentifier: PartyIdentifier,
    private readonly partyPinIdentifier: PartyPinIdentifier,
    private readonly userIdentifier: UserIdentifier,
  ) {
    super();
  }

  async findPartyByPin(pin: PartyPin): Promise<PartyJoinTarget | null> {
    const party = await this.prisma.party.findFirst({
      where: {
        pin,
        deletedAt: null,
      },
      select: {
        id: true,
        gameId: true,
        hostId: true,
        pin: true,
        status: true,
      },
    });

    if (!party) {
      return null;
    }

    return {
      partyId: this.partyIdentifier.parse(party.id),
      gameId: this.gameIdentifier.parse(party.gameId),
      hostUserId: this.userIdentifier.parse(party.hostId),
      pin: this.partyPinIdentifier.parse(party.pin),
      status: this.partyReadModelMapper.toPartyStatus(party.status),
    };
  }

  async findActivePartyByUserId(userId: number): Promise<ActivePlayerPartySession | null> {
    const party = await this.prisma.party.findFirst({
      where: {
        deletedAt: null,
        game: {
          deletedAt: null,
        },
        scores: {
          some: {
            userId,
            deletedAt: null,
          },
        },
        status: {
          in: [...ACTIVE_PARTY_STATUSES],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        gameId: true,
        pin: true,
        status: true,
      },
    });

    if (!party) {
      return null;
    }

    return {
      partyId: this.partyIdentifier.parse(party.id),
      gameId: this.gameIdentifier.parse(party.gameId),
      pin: this.partyPinIdentifier.parse(party.pin),
      status: this.partyReadModelMapper.toPartyStatus(party.status),
    };
  }

  async findPartyPlayer(command: FindPartyPlayerCommand) {
    if (command.playerIdentity.kind === PartyPlayerKind.USER) {
      const scores = await this.prisma.score.findMany({
        where: {
          partyId: command.partyId,
          userId: command.playerIdentity.userId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          createdAt: true,
          points: true,
          user: {
            select: {
              id: true,
              username: true,
              avatar: {
                select: {
                  updatedAt: true,
                },
              },
            },
          },
          guest: {
            select: {
              id: true,
              username: true,
              createdAt: true,
            },
          },
        },
      });

      const player = this.partyReadModelMapper.collectPlayers(
        this.normalizePlayerScores(scores),
      )[0];

      return player ? this.partyReadModelMapper.toPartyPlayer(player) : null;
    }

    const scores = await this.prisma.score.findMany({
      where: {
        partyId: command.partyId,
        guestId: command.playerIdentity.guestId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        createdAt: true,
        points: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: {
              select: {
                updatedAt: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            username: true,
            createdAt: true,
          },
        },
      },
    });

    const player = this.partyReadModelMapper.collectPlayers(this.normalizePlayerScores(scores))[0];

    return player ? this.partyReadModelMapper.toPartyPlayer(player) : null;
  }

  async ensureAuthenticatedPlayer(command: EnsureAuthenticatedPlayerCommand): Promise<void> {
    const isHost = await this.prisma.party.findFirst({
      where: {
        id: command.partyId,
        hostId: command.userId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (isHost) {
      return;
    }

    const existing = await this.prisma.score.findFirst({
      where: {
        partyId: command.partyId,
        userId: command.userId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      return;
    }

    await this.prisma.score.create({
      data: {
        partyId: command.partyId,
        userId: command.userId,
      },
    });
  }

  async ensureGuestPlayer(command: EnsureGuestPlayerCommand): Promise<GuestPartyPlayerIdentity> {
    const guestId = command.guestId ?? this.guestIdentifier.parse(randomUUID());
    const existingGuest = await this.guestRepository.findById(guestId);

    if (!existingGuest) {
      await this.guestRepository.create({
        id: guestId,
        username: command.username,
        avatarSeed: guestId,
      });
    }

    const existingScore = await this.prisma.score.findFirst({
      where: {
        partyId: command.partyId,
        guestId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!existingScore) {
      await this.prisma.score.create({
        data: {
          partyId: command.partyId,
          guestId,
        },
      });
    }

    return {
      kind: PartyPlayerKind.GUEST,
      guestId,
    };
  }

  async removePlayer(command: RemovePartyPlayerCommand): Promise<boolean> {
    if (command.playerIdentity.kind === PartyPlayerKind.USER) {
      const result = await this.prisma.score.deleteMany({
        where: {
          partyId: command.partyId,
          userId: command.playerIdentity.userId,
        },
      });

      return result.count > 0;
    }

    const guestIdentity = command.playerIdentity;

    return this.prisma.$transaction(async (transaction) => {
      const deletedScores = await transaction.score.deleteMany({
        where: {
          partyId: command.partyId,
          guestId: guestIdentity.guestId,
        },
      });

      let deletedGuestsCount = 0;

      const remainingGuestScores = await transaction.score.count({
        where: {
          guestId: guestIdentity.guestId,
        },
      });

      if (remainingGuestScores === 0) {
        const deletedGuests = await transaction.guest.deleteMany({
          where: {
            id: guestIdentity.guestId,
          },
        });

        deletedGuestsCount = deletedGuests.count;
      }

      return deletedScores.count > 0 || deletedGuestsCount > 0;
    });
  }

  private normalizePlayerScores<
    TScore extends {
      readonly createdAt: Date;
      readonly points?: number;
      readonly user: {
        readonly id: number;
        readonly username: string;
        readonly avatar: {
          readonly updatedAt: Date;
        } | null;
      } | null;
      readonly guest: {
        readonly id: string;
        readonly username: string;
        readonly createdAt?: Date;
      } | null;
    },
  >(scores: readonly TScore[]) {
    return scores.map((score) => ({
      ...score,
      user: score.user
        ? {
            ...score.user,
            id: this.userIdentifier.parse(score.user.id),
          }
        : null,
      guest: score.guest
        ? {
            ...score.guest,
            id: this.guestIdentifier.parse(score.guest.id),
          }
        : null,
    }));
  }
}
