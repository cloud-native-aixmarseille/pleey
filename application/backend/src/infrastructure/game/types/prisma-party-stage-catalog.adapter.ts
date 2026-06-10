import { Injectable } from '@nestjs/common';
import {
  type PartyStageCatalogEntry,
  PartyStageCatalogPort,
  type PartyStageCatalogQueryOptions,
} from '../../../application/game/types/shared/ports/party-stage-catalog.port';
import { GameTypeParser } from '../../../application/game/types/shared/services/game-type-parser';
import type { GameId } from '../../../domain/game/entities/game';
import { PrismaService } from '../../database/prisma-service';
import {
  type GameTypePartyStageCatalogProvider,
  GameTypePartyStageCatalogProviderRegistry,
} from './shared/game-type-party-stage-catalog-provider-registry';

@Injectable()
export class PrismaPartyStageCatalogAdapter extends PartyStageCatalogPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gameTypeParser: GameTypeParser,
    private readonly stageCatalogProviderRegistry: GameTypePartyStageCatalogProviderRegistry,
  ) {
    super();
  }

  async findStageById(
    gameId: GameId,
    stageId: PartyStageCatalogEntry['id'],
    options?: PartyStageCatalogQueryOptions,
  ): Promise<PartyStageCatalogEntry | null> {
    const provider = await this.resolveProvider(gameId);

    if (!provider) {
      return null;
    }

    const stage = await provider.findStageById(gameId, stageId);

    if (!stage) {
      return null;
    }

    if (!this.shouldApplyPartyScopedRandomization(options)) {
      return stage;
    }

    const orderedStages = await this.resolveOrderedStages(provider, gameId, options);

    return orderedStages.find((entry) => entry.id === stageId) ?? null;
  }

  async findFirstStage(
    gameId: GameId,
    options?: PartyStageCatalogQueryOptions,
  ): Promise<PartyStageCatalogEntry | null> {
    const provider = await this.resolveProvider(gameId);

    if (!provider) {
      return null;
    }

    if (!this.shouldRandomizeQuestionOrder(options)) {
      const stage = await provider.findFirstStage(gameId);

      if (!stage) {
        return null;
      }

      return this.shouldRandomizeAnswerOrder(options)
        ? this.randomizeStageActions(stage, options)
        : stage;
    }

    const orderedStages = await this.resolveOrderedStages(provider, gameId, options);

    return orderedStages[0] ?? null;
  }

  async findNextStage(
    gameId: GameId,
    currentStageId: PartyStageCatalogEntry['id'],
    options?: PartyStageCatalogQueryOptions,
  ): Promise<PartyStageCatalogEntry | null> {
    const provider = await this.resolveProvider(gameId);

    if (!provider) {
      return null;
    }

    if (!this.shouldRandomizeQuestionOrder(options)) {
      const stage = await provider.findNextStage(gameId, currentStageId);

      if (!stage) {
        return null;
      }

      return this.shouldRandomizeAnswerOrder(options)
        ? this.randomizeStageActions(stage, options)
        : stage;
    }

    const orderedStages = await this.resolveOrderedStages(provider, gameId, options);
    const index = orderedStages.findIndex((stage) => stage.id === currentStageId);

    return index < 0 ? null : (orderedStages[index + 1] ?? null);
  }

  async findPreviousStage(
    gameId: GameId,
    currentStageId: PartyStageCatalogEntry['id'],
    options?: PartyStageCatalogQueryOptions,
  ): Promise<PartyStageCatalogEntry | null> {
    const provider = await this.resolveProvider(gameId);

    if (!provider) {
      return null;
    }

    if (!this.shouldRandomizeQuestionOrder(options)) {
      const stage = await provider.findPreviousStage(gameId, currentStageId);

      if (!stage) {
        return null;
      }

      return this.shouldRandomizeAnswerOrder(options)
        ? this.randomizeStageActions(stage, options)
        : stage;
    }

    const orderedStages = await this.resolveOrderedStages(provider, gameId, options);
    const index = orderedStages.findIndex((stage) => stage.id === currentStageId);

    return index <= 0 ? null : (orderedStages[index - 1] ?? null);
  }

  async listStages(
    gameId: GameId,
    options?: PartyStageCatalogQueryOptions,
  ): Promise<readonly PartyStageCatalogEntry[]> {
    const provider = await this.resolveProvider(gameId);

    if (!provider) {
      return [];
    }

    return this.resolveOrderedStages(provider, gameId, options);
  }

  private async resolveProvider(gameId: GameId): Promise<GameTypePartyStageCatalogProvider | null> {
    const game = await this.prisma.game.findFirst({
      where: {
        id: gameId,
        deletedAt: null,
      },
      select: {
        type: true,
      },
    });

    if (!game) {
      return null;
    }

    const gameType = this.gameTypeParser.parse(game.type);

    return this.stageCatalogProviderRegistry.resolveByGameType(gameType);
  }

  private async resolveOrderedStages(
    provider: GameTypePartyStageCatalogProvider,
    gameId: GameId,
    options?: PartyStageCatalogQueryOptions,
  ): Promise<readonly PartyStageCatalogEntry[]> {
    const stages = await provider.listStages(gameId);
    const questionRandomized = this.shouldRandomizeQuestionOrder(options);
    const answerRandomized = this.shouldRandomizeAnswerOrder(options);

    if (!questionRandomized && !answerRandomized) {
      return stages;
    }

    const partySeed = String(options?.partyId);
    const stageOrdered = questionRandomized
      ? [...stages]
          .map((stage) => ({
            rank: this.toDeterministicRank(`${partySeed}:stage-order`, String(stage.id)),
            stage,
          }))
          .sort(
            (left, right) =>
              left.rank - right.rank || left.stage.stagePosition - right.stage.stagePosition,
          )
          .map((entry) => entry.stage)
      : stages;

    return stageOrdered.map((stage, index) => {
      const normalizedStage: PartyStageCatalogEntry = {
        ...stage,
        stagePosition: questionRandomized ? index : stage.stagePosition,
      };

      return answerRandomized
        ? this.randomizeStageActions(normalizedStage, options)
        : normalizedStage;
    });
  }

  private randomizeStageActions(
    stage: PartyStageCatalogEntry,
    options?: PartyStageCatalogQueryOptions,
  ): PartyStageCatalogEntry {
    if (!this.shouldRandomizeAnswerOrder(options)) {
      return stage;
    }

    const actionSeed = `${String(options?.partyId)}:action-order:${String(stage.id)}`;
    const actions = [...stage.actions]
      .map((action, index) => ({
        action,
        index,
        rank: this.toDeterministicRank(actionSeed, String(action.id)),
      }))
      .sort((left, right) => left.rank - right.rank || left.index - right.index)
      .map((entry) => entry.action);

    return {
      ...stage,
      actions,
    };
  }

  private shouldApplyPartyScopedRandomization(options?: PartyStageCatalogQueryOptions): boolean {
    return this.shouldRandomizeQuestionOrder(options) || this.shouldRandomizeAnswerOrder(options);
  }

  private shouldRandomizeQuestionOrder(options?: PartyStageCatalogQueryOptions): boolean {
    return Boolean(options?.partyId && options.settings?.randomizeStageOrder);
  }

  private shouldRandomizeAnswerOrder(options?: PartyStageCatalogQueryOptions): boolean {
    return Boolean(options?.partyId && options.settings?.randomizeOptionOrder);
  }

  private toDeterministicRank(seed: string, value: string): number {
    const input = `${seed}::${value}`;
    let hash = 2_166_136_261;

    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16_777_619);
    }

    return hash >>> 0;
  }
}
