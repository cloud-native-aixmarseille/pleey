import { Inject, Injectable } from '@nestjs/common';
import type { GuestPartyPlayerIdentity, PartyPin } from '@pleey/contracts/party';
import { PartyPlayerKind } from '@pleey/contracts/party';
import { Prisma } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';
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
import { PartyCommandNotAvailableError } from '../../../domain/game/errors';
import type { UserId } from '../../../domain/identity/entities/user';
import type { GuestRepository } from '../../../domain/identity/ports/guest.repository';
import { GuestRepositoryProvider } from '../../../domain/identity/ports/guest.repository';
import { PrismaService } from '../../database/prisma-service';
import { PrismaPartySettingsMapper } from '../shared/prisma-party-settings.mapper';
import { PrismaPartyPlayerRemovalService } from './services/prisma-party-player-removal.service';
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
    private readonly partyPlayerRemovalService: PrismaPartyPlayerRemovalService,
    private readonly partyIdentifier: PartyIdentifier,
    private readonly partyPinIdentifier: PartyPinIdentifier,
    private readonly userIdentifier: UserIdentifier,
    private readonly partySettingsMapper: PrismaPartySettingsMapper,
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
        passwordHash: true,
        pin: true,
        settings: true,
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
      privatePartyPasswordHash: party.passwordHash,
      pin: this.partyPinIdentifier.parse(party.pin),
      settings: this.partySettingsMapper.toPartySettings(party.settings),
      status: this.partyReadModelMapper.toPartyStatus(party.status),
    };
  }

  async findActivePartyByUserId(userId: UserId): Promise<ActivePlayerPartySession | null> {
    const claim = await this.prisma.userParticipationClaim.findUnique({
      where: { userId },
      select: {
        party: {
          select: {
            deletedAt: true,
            gameId: true,
            id: true,
            pin: true,
            status: true,
          },
        },
      },
    });
    const party = claim?.party;
    if (
      !party ||
      party.deletedAt ||
      !ACTIVE_PARTY_STATUSES.includes(party.status as (typeof ACTIVE_PARTY_STATUSES)[number])
    ) {
      return null;
    }

    return {
      partyId: this.partyIdentifier.parse(party.id),
      gameId: this.gameIdentifier.parse(party.gameId),
      pin: this.partyPinIdentifier.parse(party.pin),
      status: this.partyReadModelMapper.toPartyStatus(party.status),
    };
  }

  async findActivePartyByGuestId(guestId: string): Promise<ActivePlayerPartySession | null> {
    const party = await this.prisma.party.findFirst({
      where: {
        deletedAt: null,
        game: {
          deletedAt: null,
        },
        scores: {
          some: {
            guestId,
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

      const player = this.partyReadModelMapper.collectPlayers(this.normalizePlayerScores(scores))[0];

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
    try {
      await this.prisma.$transaction(async (transaction) => {
        const party = await transaction.party.findUnique({
          where: { id: command.partyId },
          select: { hostId: true },
        });
        if (!party) {
          throw new PartyCommandNotAvailableError({ partyId: command.partyId });
        }
        const user = await transaction.user.findUnique({
          where: { id: command.userId },
          select: { username: true },
        });
        if (!user) {
          throw new PartyCommandNotAvailableError({ partyId: command.partyId, userId: command.userId });
        }
        const existing = await transaction.partyParticipant.findUnique({
          where: {
            partyId_userId: { partyId: command.partyId, userId: command.userId },
          },
          select: { id: true, roles: true, status: true },
        });
        const isHost = party.hostId === command.userId;
        if (existing?.status === 'KICKED') {
          throw new PartyCommandNotAvailableError({ partyId: command.partyId, reason: 'kickedParticipant' });
        }
        const roles = isHost
          ? [...new Set([...(existing?.roles ?? []), 'HOST'])]
          : [...new Set([...(existing?.roles ?? []), 'PLAYER'])];
        const participant = await transaction.partyParticipant.upsert({
          where: {
            partyId_userId: { partyId: command.partyId, userId: command.userId },
          },
          create: {
            displayName: user.username,
            partyId: command.partyId,
            roles,
            status: 'ACTIVE',
            userId: command.userId,
          },
          update: {
            displayName: user.username,
            roles,
            status: 'ACTIVE',
          },
        });
        if (isHost) return;

        const otherClaim = await transaction.userParticipationClaim.findUnique({
          where: { userId: command.userId },
        });
        if (otherClaim && otherClaim.partyId !== command.partyId) {
          throw new PartyCommandNotAvailableError({
            partyId: command.partyId,
            reason: 'activeParticipantClaim',
          });
        }
        if (!otherClaim) {
          await transaction.userParticipationClaim.create({
            data: { partyId: command.partyId, userId: command.userId },
          });
        }
        const score = await transaction.score.findFirst({
          where: { participantId: participant.id },
          select: { id: true },
        });
        if (score) {
          await transaction.score.update({ data: { deletedAt: null }, where: { id: score.id } });
        } else {
          await transaction.score.create({
            data: {
              participantId: participant.id,
              partyId: command.partyId,
              userId: command.userId,
            },
          });
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new PartyCommandNotAvailableError({
          partyId: command.partyId,
          reason: 'activeParticipantClaim',
        });
      }
      throw error;
    }
  }

  async ensureGuestPlayer(command: EnsureGuestPlayerCommand): Promise<GuestPartyPlayerIdentity> {
    const guestId = command.guestId ?? this.guestIdentifier.parse(uuidv7());
    const existingGuest = await this.guestRepository.findById(guestId);
    const username = command.username.trim();
    const avatarSeed = command.avatarSeed?.trim() || undefined;

    if (!existingGuest) {
      await this.guestRepository.create({
        id: guestId,
        username,
        avatarSeed: avatarSeed ?? guestId,
      });
    } else {
      const nextUsername = username.length > 0 ? username : existingGuest.username;
      const nextAvatarSeed = avatarSeed ?? existingGuest.avatarSeed;

      if (nextUsername !== existingGuest.username || nextAvatarSeed !== existingGuest.avatarSeed) {
        await this.guestRepository.upsert({
          id: guestId,
          username: nextUsername,
          avatarSeed: nextAvatarSeed,
        });
      }
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
    return this.partyPlayerRemovalService.removePlayer(command);
  }

  private normalizePlayerScores<
    TScore extends {
      readonly createdAt: Date;
      readonly points?: number;
      readonly user: {
        readonly id: string;
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
