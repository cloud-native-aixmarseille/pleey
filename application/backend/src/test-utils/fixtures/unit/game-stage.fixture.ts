import {
  GameAction,
  type GameActionId,
  GameStage,
  type GameStageId,
  type GameStageType,
} from '../../../domain/game/entities/game-stage';

export type GameStageFixtureParams = {
  id?: GameStageId;
  sourceId?: number;
  position?: number;
  text?: string;
  type?: GameStageType;
  actions?: GameAction[];
  timeLimit?: number;
  points?: number;
};

export const createGameStageFixture = (params: GameStageFixtureParams = {}): GameStage => {
  const stageId = params.id ?? (1 as GameStageId);
  const actions = params.actions ?? [
    new GameAction(1 as GameActionId, stageId, '4', 0, true),
    new GameAction(2 as GameActionId, stageId, '3', 1, false),
    new GameAction(3 as GameActionId, stageId, '5', 2, false),
    new GameAction(4 as GameActionId, stageId, '6', 3, false),
  ];

  return new GameStage(
    stageId,
    params.sourceId ?? 1,
    params.position ?? 1,
    params.text ?? 'What is 2 + 2?',
    params.type ?? 'multiple',
    actions,
    params.timeLimit ?? 20,
    params.points ?? 1000,
  );
};
