import { QuizQuestionType } from '../../../domain/game/types/quiz/entities/quiz-question';

export type QuizQuestionRecordFixtureParams = {
  id?: number;
  quizId?: number;
  position?: number;
  questionText?: string;
  type?: string;
  timeLimit?: number;
  points?: number;
  answers?: ReadonlyArray<{ id: number; text: string; position: number; isCorrect: boolean }>;
};

export const createQuizQuestionRecordFixture = (params: QuizQuestionRecordFixtureParams = {}) => ({
  id: params.id ?? 10,
  quizId: params.quizId ?? 5,
  position: params.position ?? 0,
  questionText: params.questionText ?? 'Question',
  type: params.type ?? QuizQuestionType.Multiple,
  timeLimit: params.timeLimit ?? 20,
  points: params.points ?? 100,
  answers: params.answers ?? [
    {
      id: 1,
      text: 'A',
      position: 0,
      isCorrect: true,
    },
  ],
});
