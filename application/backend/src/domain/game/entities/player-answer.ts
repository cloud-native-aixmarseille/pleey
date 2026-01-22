import type { QuestionAnswerId } from '../../quiz/entities/question-answer';

export interface PlayerAnswerProps {
  playerId: string;
  answerId: QuestionAnswerId;
  isCorrect: boolean;
  points: number;
  timeLeft: number;
}

export class PlayerAnswer {
  readonly playerId: string;
  readonly answerId: QuestionAnswerId;
  readonly isCorrect: boolean;
  readonly points: number;
  readonly timeLeft: number;

  private constructor(props: PlayerAnswerProps) {
    this.playerId = props.playerId;
    this.answerId = props.answerId;
    this.isCorrect = props.isCorrect;
    this.points = props.points;
    this.timeLeft = props.timeLeft;
  }

  static create(props: PlayerAnswerProps): PlayerAnswer {
    return new PlayerAnswer(props);
  }
}
