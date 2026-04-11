import { Injectable } from '@nestjs/common';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import { ProjectIdentifier } from '../../../../application/workspace/shared/services/identifiers/project-identifier';
import { PartyStatus } from '../../../../domain/game/party/enums/party-status.enum';
import { Prediction } from '../../../../domain/game/types/prediction/entities/prediction';
import type {
  CreatePredictionData,
  PredictionManagementRepository,
  UpdatePredictionData,
} from '../../../../domain/game/types/prediction/ports/prediction-management.repository';
import { GameType } from '../../../../domain/game/types/shared/entities/game-type';
import { PrismaService } from '../../../database/prisma-service';

const ACTIVE_PARTY_STATUSES = [PartyStatus.WAITING, PartyStatus.ACTIVE, PartyStatus.PAUSED];

interface PredictionRecord {
  readonly id: number;
  readonly gameId: number;
  readonly game: {
    readonly id: number;
    readonly projectId: number;
    readonly title: string;
    readonly description: string | null;
    readonly createdAt: Date;
  };
  readonly _count: {
    readonly prompts: number;
  };
}

@Injectable()
export class PrismaPredictionManagementRepository implements PredictionManagementRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gameIdentifier: GameIdentifier,
    private readonly gameTypeIdentifier: GameTypeIdentifier,
    private readonly projectIdentifier: ProjectIdentifier,
  ) {}

  async create(data: CreatePredictionData): Promise<Prediction> {
    const game = await this.prisma.game.create({
      data: {
        type: GameType.Prediction,
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        prediction: {
          create: {},
        },
      },
      include: {
        prediction: {
          include: {
            _count: {
              select: { prompts: true },
            },
            game: true,
          },
        },
      },
    });

    if (!game.prediction) {
      throw new Error('PREDICTION_NOT_CREATED');
    }

    return this.toDomain(game.prediction);
  }

  async findById(id: number): Promise<Prediction | null> {
    const prediction = await this.prisma.prediction.findFirst({
      where: {
        id,
        deletedAt: null,
        game: {
          deletedAt: null,
        },
      },
      include: {
        game: true,
        _count: {
          select: { prompts: { where: { deletedAt: null } } },
        },
      },
    });

    return prediction ? this.toDomain(prediction) : null;
  }

  async update(id: number, data: UpdatePredictionData): Promise<Prediction> {
    const prediction = await this.prisma.prediction.findUniqueOrThrow({ where: { id } });
    await this.prisma.game.update({
      where: { id: prediction.gameId },
      data: {
        title: data.title,
        description: data.description,
      },
    });

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('PREDICTION_NOT_UPDATED');
    }

    return updated;
  }

  async delete(id: number): Promise<void> {
    const deletedAt = new Date();
    const prediction = await this.prisma.prediction.findUniqueOrThrow({ where: { id } });

    await this.prisma.$transaction([
      this.prisma.prediction.update({ where: { id }, data: { deletedAt } }),
      this.prisma.game.update({ where: { id: prediction.gameId }, data: { deletedAt } }),
    ]);
  }

  async hasActiveParty(gameId: number): Promise<boolean> {
    const activePartyCount = await this.prisma.party.count({
      where: {
        gameId,
        deletedAt: null,
        status: { in: ACTIVE_PARTY_STATUSES },
      },
    });

    return activePartyCount > 0;
  }

  private toDomain(prediction: PredictionRecord): Prediction {
    return new Prediction(
      this.gameTypeIdentifier.parse(prediction.id),
      this.gameIdentifier.parse(prediction.gameId),
      this.projectIdentifier.parse(prediction.game.projectId),
      prediction.game.title,
      prediction.game.description,
      prediction.game.createdAt,
      prediction._count.prompts,
    );
  }
}
