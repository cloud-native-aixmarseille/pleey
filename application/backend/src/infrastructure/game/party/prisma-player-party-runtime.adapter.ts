import { Injectable } from '@nestjs/common';
import type { PartyPin } from '@pleey/contracts/party';
import { PartyPlayerKind } from '@pleey/contracts/party';
import { Prisma } from '@prisma/client';
import {
  type ActivePlayerPartySession,
  type EnsureAuthenticatedPlayerCommand,
  type FindPartyPlayerCommand,
  type PartyJoinTarget,
  PlayerPartyRuntimePort,
  type RemovePartyPlayerCommand,
} from '../../../application/game/party/player/ports/player-party-runtime.port';
import { PartyIdentifier } from '../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyParticipantIdentifier } from '../../../application/game/party/shared/services/identifiers/party-participant-identifier';
import { PartyPinIdentifier } from '../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GameIdentifier } from '../../../application/game/shared/services/identifiers/game-identifier';
import { UserIdentifier } from '../../../application/identity/shared/services/identifiers/user-identifier';
import { PartyCommandNotAvailableError } from '../../../domain/game/errors';
import type { UserId } from '../../../domain/identity/entities/user';
import { PrismaService } from '../../database/prisma-service';
import { PrismaPartySettingsMapper } from '../shared/prisma-party-settings.mapper';
import { PrismaPartyPlayerRemovalService } from './services/prisma-party-player-removal.service';
import { PrismaPartyReadModelMapper } from './services/prisma-party-read-model-mapper';

const ACTIVE_PARTY_STATUSES = ['waiting', 'active', 'paused'] as const;

@Injectable()
export class PrismaPlayerPartyRuntimeAdapter extends PlayerPartyRuntimePort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gameIdentifier: GameIdentifier,
    private readonly partyReadModelMapper: PrismaPartyReadModelMapper,
    private readonly partyPlayerRemovalService: PrismaPartyPlayerRemovalService,
    private readonly partyIdentifier: PartyIdentifier,
    private readonly partyPinIdentifier: PartyPinIdentifier,
    private readonly userIdentifier: UserIdentifier,
    private readonly participantIdentifier: PartyParticipantIdentifier,
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

  async findPartyPlayer(command: FindPartyPlayerCommand) {
    const participantWhere =
      command.playerIdentity.kind === PartyPlayerKind.USER
        ? { userId: command.playerIdentity.userId }
        : { id: command.playerIdentity.participantId, userId: null };
    const scores = await this.prisma.score.findMany({
      where: {
        partyId: command.partyId,
        deletedAt: null,
        participant: participantWhere,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        createdAt: true,
        points: true,
        participant: {
          select: {
            id: true,
            displayName: true,
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
          },
        },
      },
    });
    const player = this.partyReadModelMapper.collectPlayers(
      scores.map((score) => ({
        ...score,
        participant: {
          ...score.participant,
          id: this.participantIdentifier.parse(score.participant.id),
          user: score.participant.user
            ? {
                ...score.participant.user,
                id: this.userIdentifier.parse(score.participant.user.id),
              }
            : null,
        },
      })),
    )[0];

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
        const existing = await transaction.partyParticipant.findFirst({
          where: { partyId: command.partyId, userId: command.userId },
          select: { id: true, roles: true, status: true },
        });
        const isHost = party.hostId === command.userId;
        if (existing?.status === 'KICKED') {
          throw new PartyCommandNotAvailableError({ partyId: command.partyId, reason: 'kickedParticipant' });
        }
        const roles = isHost
          ? [...new Set([...(existing?.roles ?? []), 'HOST'])]
          : [...new Set([...(existing?.roles ?? []), 'PLAYER'])];
        const participant = existing
          ? await transaction.partyParticipant.update({
              data: { displayName: user.username, roles, status: 'ACTIVE' },
              where: { id: existing.id },
            })
          : await transaction.partyParticipant.create({
              data: {
                displayName: user.username,
                partyId: command.partyId,
                roles,
                status: 'ACTIVE',
                userId: command.userId,
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

  async removePlayer(command: RemovePartyPlayerCommand): Promise<boolean> {
    return this.partyPlayerRemovalService.removePlayer(command);
  }
}
