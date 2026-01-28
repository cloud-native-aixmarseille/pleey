import { Injectable } from '@nestjs/common';
import type { Prediction as PrismaPrediction } from '@prisma/client';
import type { GameId } from '../../../domain/game/entities/game';
import { Prediction, type PredictionId } from '../../../domain/prediction/entities/prediction';
import type { PredictionRepository } from '../../../domain/prediction/ports/prediction.repository';
import { PrismaService } from '../../database/prisma-service';

@Injectable()
export class PrismaPredictionRepository implements PredictionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(gameId: GameId): Promise<Prediction> {
    const prediction = await this.prisma.prediction.create({
      data: {
        game: {
          connect: { id: gameId },
        },
      },
    });

    return this.toDomain(prediction);
  }

  async findById(id: PredictionId): Promise<Prediction | null> {
    const prediction = await this.prisma.prediction.findFirst({
      where: {
        id,
        deletedAt: null,
        game: {
          deletedAt: null,
        },
      },
    });

    if (!prediction) return null;
    return this.toDomain(prediction);
  }

  async findByGameId(gameId: GameId): Promise<Prediction | null> {
    const prediction = await this.prisma.prediction.findFirst({
      where: {
        gameId,
        deletedAt: null,
        game: {
          deletedAt: null,
        },
      },
    });

    if (!prediction) return null;
    return this.toDomain(prediction);
  }

  private toDomain(prediction: PrismaPrediction, promptCount = 0): Prediction {
    return new Prediction(prediction.id, prediction.gameId, prediction.createdAt, promptCount);
  }
}
