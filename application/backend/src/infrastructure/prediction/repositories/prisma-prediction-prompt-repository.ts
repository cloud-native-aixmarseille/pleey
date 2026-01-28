import { Injectable } from '@nestjs/common';
import type {
  PredictionOption as PrismaPredictionOption,
  PredictionPrompt as PrismaPredictionPrompt,
} from '@prisma/client';
import type { PredictionId } from '../../../domain/prediction/entities/prediction';
import {
  PredictionOption,
  type PredictionOptionId,
} from '../../../domain/prediction/entities/prediction-option';
import {
  PredictionPrompt,
  type PredictionPromptId,
} from '../../../domain/prediction/entities/prediction-prompt';
import type { PredictionPromptRepository } from '../../../domain/prediction/ports/prediction-prompt.repository';
import { PrismaService } from '../../database/prisma-service';

@Injectable()
export class PrismaPredictionPromptRepository implements PredictionPromptRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    predictionId: PredictionId;
    position?: number;
    promptText: string;
    options: Array<{
      id?: PredictionOptionId;
      text?: string | null;
      position?: number;
      isCorrect?: boolean;
    }>;
    timeLimit?: number;
    points?: number;
  }): Promise<PredictionPrompt> {
    const prompt = await this.prisma.$transaction(async (tx) => {
      const latestPosition = await tx.predictionPrompt.findFirst({
        where: { predictionId: data.predictionId },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      const nextPosition = latestPosition?.position ?? -1;

      const created = await tx.predictionPrompt.create({
        data: {
          predictionId: data.predictionId,
          position: data.position ?? nextPosition + 1,
          promptText: data.promptText,
          timeLimit: data.timeLimit ?? 20,
          points: data.points ?? 1000,
        },
      });

      const normalizedOptions = data.options.map((option, index) => ({
        id: option.id ?? index,
        text: option.text,
        position: option.position ?? index,
        isCorrect: Boolean(option.isCorrect),
      }));

      await Promise.all(
        normalizedOptions.map((option) =>
          tx.predictionOption.create({
            data: {
              promptId: created.id,
              text: option.text ?? null,
              position: option.position,
              isCorrect: option.isCorrect,
            },
          }),
        ),
      );

      return tx.predictionPrompt.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          options: {
            orderBy: { position: 'asc' },
          },
        },
      });
    });

    return this.toDomain(prompt);
  }

  async findById(id: PredictionPromptId): Promise<PredictionPrompt | null> {
    const prompt = await this.prisma.predictionPrompt.findFirst({
      where: {
        id,
        deletedAt: null,
        prediction: {
          deletedAt: null,
        },
      },
      include: {
        options: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!prompt) return null;
    return this.toDomain(prompt);
  }

  async findByPredictionId(predictionId: PredictionId): Promise<PredictionPrompt[]> {
    const prompts = await this.prisma.predictionPrompt.findMany({
      where: {
        predictionId,
        deletedAt: null,
        prediction: {
          deletedAt: null,
        },
      },
      include: {
        options: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { position: 'asc' },
    });

    return prompts.map((prompt) => this.toDomain(prompt));
  }

  async delete(id: PredictionPromptId): Promise<void> {
    await this.prisma.predictionPrompt.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async update(
    id: PredictionPromptId,
    data: {
      predictionId?: PredictionId;
      position?: number;
      promptText?: string;
      options?: Array<{
        id?: PredictionOptionId;
        text?: string | null;
        position?: number;
        isCorrect?: boolean;
      }>;
      timeLimit?: number;
      points?: number;
    },
  ): Promise<PredictionPrompt> {
    const prompt = await this.prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {};

      if (data.predictionId !== undefined) updateData.predictionId = data.predictionId;
      if (data.position !== undefined) updateData.position = data.position;
      if (data.promptText !== undefined) updateData.promptText = data.promptText;
      if (data.timeLimit !== undefined) updateData.timeLimit = data.timeLimit;
      if (data.points !== undefined) updateData.points = data.points;

      if (Object.keys(updateData).length > 0) {
        await tx.predictionPrompt.update({
          where: { id },
          data: updateData,
        });
      }

      if (data.options) {
        const normalizedOptions = data.options.map((option, index) => ({
          id: option.id ?? index,
          text: option.text,
          position: option.position ?? index,
          isCorrect: Boolean(option.isCorrect),
        }));

        await tx.predictionOption.deleteMany({ where: { promptId: id } });

        await Promise.all(
          normalizedOptions.map((option) =>
            tx.predictionOption.create({
              data: {
                promptId: id,
                text: option.text ?? null,
                position: option.position,
                isCorrect: option.isCorrect,
              },
            }),
          ),
        );
      }

      return tx.predictionPrompt.findUniqueOrThrow({
        where: { id },
        include: {
          options: {
            orderBy: { position: 'asc' },
          },
        },
      });
    });

    return this.toDomain(prompt);
  }

  private toDomain(
    prompt: PrismaPredictionPrompt & { options?: PrismaPredictionOption[] },
  ): PredictionPrompt {
    return new PredictionPrompt(
      prompt.id,
      prompt.predictionId,
      prompt.position,
      prompt.promptText,
      (prompt.options ?? []).map(
        (option) =>
          new PredictionOption(
            option.id,
            option.promptId,
            option.text,
            option.position,
            option.isCorrect,
          ),
      ),
      prompt.timeLimit,
      prompt.points,
    );
  }
}
