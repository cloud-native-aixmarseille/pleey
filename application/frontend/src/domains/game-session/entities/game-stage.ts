import type { GameAction } from './game-action';

export interface GameStage {
  readonly id: number;
  readonly sourceId: number;
  readonly position: number;
  readonly text: string;
  readonly type: string;
  readonly actions: readonly GameAction[];
  readonly timeLimit: number;
  readonly points: number;
}
