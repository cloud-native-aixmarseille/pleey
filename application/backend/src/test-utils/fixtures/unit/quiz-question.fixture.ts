import { QuizQuestionType } from '../../../domain/game/types/quiz/entities/quiz-question';
import { backendTestIdentifiers } from '../../branded-identifiers';

export type QuizQuestionRecordFixtureParams = {
  id?: string;
  quizId?: string;
  position?: number;
  questionText?: string;
  type?: string;
  timeLimit?: number;
  points?: number;
  answers?: ReadonlyArray<{ id: string; text: string; position: number; isCorrect: boolean }>;
};

export const createQuizQuestionRecordFixture = (params: QuizQuestionRecordFixtureParams = {}) => ({
  id: params.id ?? backendTestIdentifiers.partyStage(10),
  quizId: params.quizId ?? backendTestIdentifiers.game(5),
  position: params.position ?? 0,
  questionText: params.questionText ?? 'Question',
  type: params.type ?? QuizQuestionType.Multiple,
  timeLimit: params.timeLimit ?? 20,
  points: params.points ?? 100,
  answers: params.answers ?? [
    {
      id: backendTestIdentifiers.partyAction(1),
      text: 'A',
      position: 0,
      isCorrect: true,
    },
  ],
});
