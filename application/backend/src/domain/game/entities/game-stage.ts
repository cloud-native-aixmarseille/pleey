export type GameStageId = number;
export type GameActionId = number;

export type GameStageType = string;

/**
 * GameAction Value Object
 * Represents a selectable action within a game stage.
 * Game-type agnostic: maps to source-specific options across supported game modes.
 */
export class GameAction {
  constructor(
    public readonly id: GameActionId,
    public readonly stageId: GameStageId,
    public readonly text: string,
    public readonly position: number,
    public readonly isCorrect: boolean,
  ) {}
}

/**
 * GameStage Domain Entity
 * Represents a single interactive step presented to players during a game session.
 * Game-type agnostic: maps to source prompts across game types.
 */
export class GameStage {
  constructor(
    public readonly id: GameStageId,
    public readonly sourceId: number,
    public readonly position: number,
    public readonly text: string,
    public readonly type: GameStageType,
    public readonly actions: GameAction[],
    public readonly timeLimit: number,
    public readonly points: number,
  ) {}

  getCorrectActions(): GameAction[] {
    return this.actions.filter((action) => action.isCorrect);
  }

  isActionCorrect(actionId: GameActionId): boolean {
    return this.getCorrectActions().some((action) => action.id === actionId);
  }

  getActions(): GameAction[] {
    return this.actions;
  }

  isValid(): boolean {
    return this.text.trim().length > 0 && this.actions.length >= 2;
  }
}
