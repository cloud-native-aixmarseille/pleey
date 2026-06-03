import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  type ActivePartyGameConflict,
  type ActivePartyHostConflict,
  type CreatePartyCommand,
  type ListPartiesQuery,
  type ManagedGameContext,
  PartyManagementPort,
} from '../../../application/game/party/shared/ports/party-management.port';
import { PartyIdentifier } from '../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GameIdentifier } from '../../../application/game/shared/services/identifiers/game-identifier';
import { UserIdentifier } from '../../../application/identity/shared/services/identifiers/user-identifier';
import { PaginationQueryNormalizer } from '../../../application/shared/services/pagination-query-normalizer';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { ProjectIdentifier } from '../../../application/workspace/shared/services/identifiers/project-identifier';
import type { GameId } from '../../../domain/game/entities/game';
import { PartyRole } from '../../../domain/game/party/enums/party-role.enum';
import { PinAlreadyInUseError } from '../../../domain/game/party/errors/pin-already-in-use.error';
import type { PartySummary } from '../../../domain/game/party/shared/entities/party-summary';
import type { UserId } from '../../../domain/identity/entities/user';
import type { PaginatedResult } from '../../../domain/shared/value-objects/paginated-result';
import { PrismaService } from '../../database/prisma-service';
import { PrismaPartyReadModelMapper } from './services/prisma-party-read-model-mapper';

const ACTIVE_PARTY_STATUSES = ['waiting', 'active', 'paused'];

@Injectable()
export class PrismaPartyManagementAdapter extends PartyManagementPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly partyIdentifier: PartyIdentifier,
    private readonly partyPinIdentifier: PartyPinIdentifier,
    private readonly gameIdentifier: GameIdentifier,
    private readonly partyReadModelMapper: PrismaPartyReadModelMapper,
    private readonly userIdentifier: UserIdentifier,
    private readonly organizationIdentifier: OrganizationIdentifier,
    private readonly projectIdentifier: ProjectIdentifier,
    private readonly paginationQueryNormalizer: PaginationQueryNormalizer,
  ) {
    super();
  }

  async findManagedGame(gameId: GameId): Promise<ManagedGameContext | null> {
    const game = await this.prisma.game.findFirst({
      where: {
        id: gameId,
        deletedAt: null,
        project: {
          deletedAt: null,
          organization: {
            deletedAt: null,
          },
        },
      },
      select: {
        id: true,
        projectId: true,
        project: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!game) {
      return null;
    }

    return {
      gameId: this.gameIdentifier.parse(game.id),
      projectId: this.projectIdentifier.parse(game.projectId),
      organizationId: this.organizationIdentifier.parse(game.project.organizationId),
    };
  }

  async findActivePartyByGameId(gameId: GameId): Promise<ActivePartyGameConflict | null> {
    const party = await this.prisma.party.findFirst({
      where: {
        gameId,
        deletedAt: null,
        status: {
          in: ACTIVE_PARTY_STATUSES,
        },
        game: {
          deletedAt: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        hostId: true,
      },
    });

    if (!party) {
      return null;
    }

    return {
      partyId: this.partyIdentifier.parse(party.id),
      hostUserId: this.userIdentifier.parse(party.hostId),
    };
  }

  async findActivePartiesByHostId(hostUserId: UserId): Promise<readonly ActivePartyHostConflict[]> {
    const parties = await this.prisma.party.findMany({
      where: {
        hostId: hostUserId,
        deletedAt: null,
        status: {
          in: ACTIVE_PARTY_STATUSES,
        },
        game: {
          deletedAt: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        gameId: true,
      },
    });

    return parties.map((party) => ({
      partyId: this.partyIdentifier.parse(party.id),
      gameId: this.gameIdentifier.parse(party.gameId),
    }));
  }

  async createParty(command: CreatePartyCommand): Promise<PartySummary> {
    try {
      const party = await this.prisma.party.create({
        data: {
          gameId: command.gameId,
          hostId: command.hostUserId,
          pin: command.pin,
          status: 'waiting',
        },
      });

      return {
        partyId: this.partyIdentifier.parse(party.id),
        gameId: this.gameIdentifier.parse(party.gameId),
        pin: this.partyPinIdentifier.parse(party.pin),
        status: this.partyReadModelMapper.toPartyStatus(party.status, {
          unknownStatus: 'validation-error',
        }),
        role: PartyRole.HOST,
        createdAt: party.createdAt,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = error.meta?.target;
        const targets = Array.isArray(target) ? target : [target].filter(Boolean);

        if (targets.some((value) => String(value).includes('pin'))) {
          throw new PinAlreadyInUseError();
        }
      }

      throw error;
    }
  }

  async listUserParties(query: ListPartiesQuery): Promise<PaginatedResult<PartySummary>> {
    const pagination = this.paginationQueryNormalizer.normalizeQuery(query, 25);
    const where = {
      deletedAt: null,
      game: {
        deletedAt: null,
        project: {
          deletedAt: null,
          organization: {
            deletedAt: null,
          },
        },
      },
      OR: [
        {
          hostId: query.userId,
        },
        {
          scores: {
            some: {
              userId: query.userId,
              deletedAt: null,
            },
          },
        },
      ],
    } satisfies Prisma.PartyWhereInput;

    const [totalCount, parties] = await this.prisma.$transaction([
      this.prisma.party.count({ where }),
      this.prisma.party.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          scores: {
            where: {
              userId: query.userId,
              deletedAt: null,
            },
            select: {
              id: true,
            },
            take: 1,
          },
        },
        skip: pagination.skip,
        take: pagination.pageSize,
      }),
    ]);

    return this.paginationQueryNormalizer.toPaginatedResult(
      pagination,
      parties.map((party) => ({
        partyId: this.partyIdentifier.parse(party.id),
        gameId: this.gameIdentifier.parse(party.gameId),
        pin: this.partyPinIdentifier.parse(party.pin),
        status: this.partyReadModelMapper.toPartyStatus(party.status, {
          unknownStatus: 'validation-error',
        }),
        role:
          party.hostId === query.userId || party.scores.length === 0
            ? PartyRole.HOST
            : PartyRole.PLAYER,
        createdAt: party.createdAt,
      })),
      totalCount,
    );
  }
}
