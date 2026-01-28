export interface GameAction {
  readonly id: number;
  readonly text: string;
  readonly position: number;
  readonly isCorrect: boolean;
}
