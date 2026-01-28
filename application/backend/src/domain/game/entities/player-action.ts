import type { GameActionId } from './game-stage';

export interface PlayerActionProps {
  playerId: string;
  actionId: GameActionId;
  isCorrect: boolean;
  points: number;
  timeLeft: number;
}

export class PlayerAction {
  readonly playerId: string;
  readonly actionId: GameActionId;
  readonly isCorrect: boolean;
  readonly points: number;
  readonly timeLeft: number;

  private constructor(props: PlayerActionProps) {
    this.playerId = props.playerId;
    this.actionId = props.actionId;
    this.isCorrect = props.isCorrect;
    this.points = props.points;
    this.timeLeft = props.timeLeft;
  }

  static create(props: PlayerActionProps): PlayerAction {
    return new PlayerAction(props);
  }
}
