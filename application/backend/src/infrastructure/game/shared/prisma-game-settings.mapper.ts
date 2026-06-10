import { Injectable } from '@nestjs/common';
import type { GameSettings } from '../../../domain/game/party/shared/entities/game-settings';

interface PrismaGameSettingsUpdate {
  readonly allowOptionChangeAfterVoting?: boolean;
  readonly randomizeOptionOrder?: boolean;
  readonly randomizeStageOrder?: boolean;
}

@Injectable()
export class PrismaGameSettingsMapper {
  readonly select = {
    allowOptionChangeAfterVoting: true,
    randomizeOptionOrder: true,
    randomizeStageOrder: true,
  } as const;

  toGameSettings(source: GameSettings): GameSettings {
    return {
      allowOptionChangeAfterVoting: source.allowOptionChangeAfterVoting,
      randomizeOptionOrder: source.randomizeOptionOrder,
      randomizeStageOrder: source.randomizeStageOrder,
    };
  }

  toPrismaGameSettingsUpdate(data: PrismaGameSettingsUpdate): PrismaGameSettingsUpdate {
    return {
      allowOptionChangeAfterVoting: data.allowOptionChangeAfterVoting,
      randomizeOptionOrder: data.randomizeOptionOrder,
      randomizeStageOrder: data.randomizeStageOrder,
    };
  }
}
