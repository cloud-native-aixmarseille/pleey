import { Inject, Injectable } from '@nestjs/common';
import type { GameId } from '../../game/entities/game';
import { GameAction, GameStage } from '../../game/entities/game-stage';
import type { GameContentProvider } from '../../game/ports/services/game-content-provider';
import { PredictionStageType } from '../enums/prediction-stage-type.enum';
import {
  type PredictionRepository,
  PredictionRepositoryProvider,
} from '../ports/prediction.repository';
import {
  type PredictionPromptRepository,
  PredictionPromptRepositoryProvider,
} from '../ports/prediction-prompt.repository';

const PREDICTION_STAGE_TYPE = PredictionStageType.MULTIPLE;

function normalizeActionText(value: string | null | undefined, position: number): string {
  const normalized = value?.trim();
  if (normalized) {
    return normalized;
  }

  return `option-${position + 1}`;
}

@Injectable()
export class PredictionGameContentProvider implements GameContentProvider {
  constructor(
    @Inject(PredictionRepositoryProvider)
    private readonly predictionRepository: PredictionRepository,
    @Inject(PredictionPromptRepositoryProvider)
    private readonly promptRepository: PredictionPromptRepository,
  ) {}

  async resolveStages(gameId: GameId): Promise<GameStage[]> {
    const prediction = await this.predictionRepository.findByGameId(gameId);
    if (!prediction) {
      return [];
    }

    const prompts = await this.promptRepository.findByPredictionId(prediction.id);
    return prompts.map(
      (prompt) =>
        new GameStage(
          prompt.id,
          prediction.id,
          prompt.position,
          prompt.promptText,
          PREDICTION_STAGE_TYPE,
          prompt.options.map(
            (option) =>
              new GameAction(
                option.id,
                prompt.id,
                normalizeActionText(option.text, option.position),
                option.position,
                option.isCorrect,
              ),
          ),
          prompt.timeLimit,
          prompt.points,
        ),
    );
  }
}
