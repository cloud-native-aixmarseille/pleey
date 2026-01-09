export interface PlayerAnswerProps {
  playerId: string;
  answer: string;
  isCorrect: boolean;
  points: number;
  timeLeft: number;
}

export class PlayerAnswer {
  readonly playerId: string;
  readonly answer: string;
  readonly isCorrect: boolean;
  readonly points: number;
  readonly timeLeft: number;

  private constructor(props: PlayerAnswerProps) {
    this.playerId = props.playerId;
    this.answer = props.answer;
    this.isCorrect = props.isCorrect;
    this.points = props.points;
    this.timeLeft = props.timeLeft;
  }

  static create(props: PlayerAnswerProps): PlayerAnswer {
    return new PlayerAnswer(props);
  }
}
