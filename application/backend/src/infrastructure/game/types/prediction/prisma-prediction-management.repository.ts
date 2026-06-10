import { Injectable } from '@nestjs/common';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import { ProjectIdentifier } from '../../../../application/workspace/shared/services/identifiers/project-identifier';
import type { GameId } from '../../../../domain/game/entities/game';
import { PartyStatus } from '../../../../domain/game/party/enums/party-status.enum';
import type { GameSettings } from '../../../../domain/game/party/shared/entities/game-settings';
import {
  Prediction,
  type PredictionId,
} from '../../../../domain/game/types/prediction/entities/prediction';
import type {
  CreatePredictionData,
  CreatePredictionWithPromptsData,
  PredictionManagementRepository,
  UpdatePredictionData,
} from '../../../../domain/game/types/prediction/ports/prediction-management.repository';
import type { GameTypeId } from '../../../../domain/game/types/shared/entities/game-type';
import { GameType } from '../../../../domain/game/types/shared/entities/game-type';
import type { ProjectId } from '../../../../domain/project/entities/project';
import { PrismaService } from '../../../database/prisma-service';
import { PrismaGameSettingsMapper } from '../../shared/prisma-game-settings.mapper';

const ACTIVE_PARTY_STATUSES = [PartyStatus.WAITING, PartyStatus.ACTIVE, PartyStatus.PAUSED];

enum PredictionManagementRepositoryErrorCode {
  PREDICTION_NOT_CREATED = 'PREDICTION_NOT_CREATED',
  PREDICTION_NOT_UPDATED = 'PREDICTION_NOT_UPDATED',
}

interface PrismaPredictionRecord extends GameSettings {
  readonly id: string;
  readonly gameId: string;
  readonly projectId: string;
  readonly title: string;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly promptCount: number;
}

interface PredictionRecord extends GameSettings {
  readonly id: PredictionId;
  readonly gameId: GameId;
  readonly projectId: ProjectId;
  readonly title: string;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly promptCount: number;
}

interface PrismaPredictionSourceRecord {
  readonly id: string;
  readonly gameId: string;
  readonly game: {
    readonly projectId: string;
    readonly title: string;
    readonly description: string | null;
    readonly createdAt: Date;
  } & GameSettings;
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
    private readonly gameSettingsMapper: PrismaGameSettingsMapper,
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
      throw new Error(PredictionManagementRepositoryErrorCode.PREDICTION_NOT_CREATED);
    }

    return this.toDomain(game.prediction);
  }

  async createWithPrompts(data: CreatePredictionWithPromptsData): Promise<Prediction> {
    const game = await this.prisma.game.create({
      data: {
        type: GameType.Prediction,
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        prediction: {
          create: {
            prompts: {
              create: data.prompts.map((prompt, index) => ({
                position: index,
                promptText: prompt.promptText,
                timeLimit: prompt.timeLimit,
                points: prompt.points,
                options: {
                  create: prompt.options.map((option) => ({
                    text: option.text,
                    position: option.position,
                    isCorrect: option.isCorrect,
                  })),
                },
              })),
            },
          },
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
      throw new Error(PredictionManagementRepositoryErrorCode.PREDICTION_NOT_CREATED);
    }

    return this.toDomain(game.prediction);
  }

  async findById(id: GameTypeId): Promise<Prediction | null> {
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

  async update(id: GameTypeId, data: UpdatePredictionData): Promise<Prediction> {
    const prediction = await this.prisma.prediction.findUniqueOrThrow({ where: { id } });
    await this.prisma.game.update({
      where: { id: prediction.gameId },
      data: {
        title: data.title,
        description: data.description,
        ...this.gameSettingsMapper.toPrismaGameSettingsUpdate(data),
      },
    });

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(PredictionManagementRepositoryErrorCode.PREDICTION_NOT_UPDATED);
    }

    return updated;
  }

  async delete(id: GameTypeId): Promise<void> {
    const deletedAt = new Date();
    const prediction = await this.prisma.prediction.findUniqueOrThrow({ where: { id } });

    await this.prisma.$transaction([
      this.prisma.prediction.update({ where: { id }, data: { deletedAt } }),
      this.prisma.game.update({ where: { id: prediction.gameId }, data: { deletedAt } }),
    ]);
  }

  async hasActiveParty(gameId: GameId): Promise<boolean> {
    const activePartyCount = await this.prisma.party.count({
      where: {
        gameId,
        deletedAt: null,
        status: { in: ACTIVE_PARTY_STATUSES },
      },
    });

    return activePartyCount > 0;
  }

  private toDomain(prediction: PrismaPredictionSourceRecord): Prediction {
    const prismaRecord = this.toPrismaPredictionRecord(prediction);
    const record = this.toPredictionRecord(prismaRecord);

    return new Prediction(
      record.id,
      record.gameId,
      record.projectId,
      record.title,
      record.description,
      record.createdAt,
      record.promptCount,
      record.allowOptionChangeAfterVoting,
      record.randomizeStageOrder,
      record.randomizeOptionOrder,
    );
  }

  private toPrismaPredictionRecord(
    prediction: PrismaPredictionSourceRecord,
  ): PrismaPredictionRecord {
    return {
      id: prediction.id,
      gameId: prediction.gameId,
      projectId: prediction.game.projectId,
      title: prediction.game.title,
      description: prediction.game.description,
      ...this.gameSettingsMapper.toGameSettings(prediction.game),
      createdAt: prediction.game.createdAt,
      promptCount: prediction._count.prompts,
    };
  }

  private toPredictionRecord(prediction: PrismaPredictionRecord): PredictionRecord {
    return {
      id: this.gameTypeIdentifier.parse(prediction.id),
      gameId: this.gameIdentifier.parse(prediction.gameId),
      projectId: this.projectIdentifier.parse(prediction.projectId),
      title: prediction.title,
      description: prediction.description,
      ...this.gameSettingsMapper.toGameSettings(prediction),
      createdAt: prediction.createdAt,
      promptCount: prediction.promptCount,
    };
  }
}
