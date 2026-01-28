import type { QuizQuestionType } from './quiz-question';

export interface QuestionFormState {
  readonly questionText: string;
  readonly type: QuizQuestionType;
  readonly answers: readonly string[];
  readonly correctAnswers: readonly number[];
  readonly timeLimit: string;
  readonly points: string;
}
