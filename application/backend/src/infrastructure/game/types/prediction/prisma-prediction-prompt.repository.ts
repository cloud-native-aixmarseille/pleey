import { Injectable } from '@nestjs/common';
import { PredictionPromptIdentifier } from '../../../../application/game/types/prediction/services/prediction-prompt-identifier';
import { PredictionSelectableOptionIdentifier } from '../../../../application/game/types/prediction/services/prediction-selectable-option-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import type { PredictionId } from '../../../../domain/game/types/prediction/entities/prediction';
import {
  PredictionPrompt,
  type PredictionPromptId,
  type PredictionSelectableOptionId,
} from '../../../../domain/game/types/prediction/entities/prediction-prompt';
import type {
  PredictionPromptMutationData,
  PredictionPromptRepository,
} from '../../../../domain/game/types/prediction/ports/prediction-prompt.repository';
import { PrismaService } from '../../../database/prisma-service';
import {
  PrismaSelectableOptionMapper,
  type PrismaSelectableOptionRecord,
} from '../shared/prisma-selectable-option-mapper';

type PrismaPredictionOptionRecord = PrismaSelectableOptionRecord;

type PredictionOptionRecord = PrismaSelectableOptionRecord<PredictionSelectableOptionId>;

interface PrismaPredictionPromptRecord {
  readonly id: number;
  readonly predictionId: number;
  readonly position: number;
  readonly promptText: string;
  readonly timeLimit: number;
  readonly points: number;
  readonly options: readonly PrismaPredictionOptionRecord[];
}

interface PredictionPromptRecord {
  readonly id: PredictionPromptId;
  readonly predictionId: PredictionId;
  readonly position: number;
  readonly promptText: string;
  readonly timeLimit: number;
  readonly points: number;
  readonly options: readonly PredictionOptionRecord[];
}

@Injectable()
export class PrismaPredictionPromptRepository implements PredictionPromptRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gameTypeIdentifier: GameTypeIdentifier,
    private readonly predictionPromptIdentifier: PredictionPromptIdentifier,
    private readonly predictionSelectableOptionIdentifier: PredictionSelectableOptionIdentifier,
    private readonly optionMapper: PrismaSelectableOptionMapper,
  ) {}

  async create(
    predictionId: PredictionId,
    data: PredictionPromptMutationData,
  ): Promise<PredictionPrompt> {
    const position = data.position ?? (await this.resolveNextPosition(predictionId));
    const prompt = await this.prisma.predictionPrompt.create({
      data: {
        predictionId,
        position,
        promptText: data.promptText,
        timeLimit: data.timeLimit,
        points: data.points,
        options: {
          create: data.options.map((option) => ({
            text: option.text,
            position: option.position,
            isCorrect: option.isCorrect,
          })),
        },
      },
      include: this.promptInclude,
    });

    return this.toDomain(prompt);
  }

  async findById(id: PredictionPromptId): Promise<PredictionPrompt | null> {
    const prompt = await this.prisma.predictionPrompt.findFirst({
      where: { id, deletedAt: null, prediction: { deletedAt: null, game: { deletedAt: null } } },
      include: this.promptInclude,
    });

    return prompt ? this.toDomain(prompt) : null;
  }

  async findByPredictionId(predictionId: PredictionId): Promise<PredictionPrompt[]> {
    const prompts = await this.prisma.predictionPrompt.findMany({
      where: {
        predictionId,
        deletedAt: null,
        prediction: { deletedAt: null, game: { deletedAt: null } },
      },
      include: this.promptInclude,
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    });

    return prompts.map((prompt) => this.toDomain(prompt));
  }

  async update(
    id: PredictionPromptId,
    data: PredictionPromptMutationData,
  ): Promise<PredictionPrompt> {
    await this.prisma.$transaction([
      this.prisma.predictionOption.deleteMany({ where: { promptId: id } }),
      this.prisma.predictionPrompt.update({
        where: { id },
        data: {
          ...(data.position === undefined ? {} : { position: data.position }),
          promptText: data.promptText,
          timeLimit: data.timeLimit,
          points: data.points,
          options: {
            create: data.options.map((option) => ({
              text: option.text,
              position: option.position,
              isCorrect: option.isCorrect,
            })),
          },
        },
      }),
    ]);

    const prompt = await this.findById(id);
    if (!prompt) {
      throw new Error('PREDICTION_PROMPT_NOT_UPDATED');
    }

    return prompt;
  }

  async delete(id: PredictionPromptId): Promise<void> {
    await this.prisma.predictionPrompt.delete({ where: { id } });
  }

  private readonly promptInclude = {
    options: {
      where: { deletedAt: null },
      orderBy: [{ position: 'asc' as const }, { id: 'asc' as const }],
      select: {
        id: true,
        text: true,
        position: true,
        isCorrect: true,
      },
    },
  };

  private async resolveNextPosition(predictionId: PredictionId): Promise<number> {
    const result = await this.prisma.predictionPrompt.aggregate({
      where: { predictionId, deletedAt: null },
      _max: { position: true },
    });

    return (result._max.position ?? -1) + 1;
  }

  private toDomain(prompt: PrismaPredictionPromptRecord): PredictionPrompt {
    const record = this.toPredictionPromptRecord(prompt);

    return new PredictionPrompt(
      record.id,
      record.predictionId,
      record.position,
      record.promptText,
      record.timeLimit,
      record.points,
      record.options.map((option) => this.optionMapper.toDomain(option)),
    );
  }

  private toPredictionPromptRecord(prompt: PrismaPredictionPromptRecord): PredictionPromptRecord {
    return {
      id: this.predictionPromptIdentifier.parse(prompt.id),
      predictionId: this.gameTypeIdentifier.parse(prompt.predictionId),
      position: prompt.position,
      promptText: prompt.promptText,
      timeLimit: prompt.timeLimit,
      points: prompt.points,
      options: prompt.options.map((option) =>
        this.optionMapper.toRecord(option, this.predictionSelectableOptionIdentifier),
      ),
    };
  }
}
