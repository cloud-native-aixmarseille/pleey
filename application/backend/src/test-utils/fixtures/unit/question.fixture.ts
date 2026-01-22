import { Question, type QuestionId, QuestionType } from '../../../domain/quiz/entities/question';
import {
  QuestionAnswer,
  type QuestionAnswerId,
} from '../../../domain/quiz/entities/question-answer';
import type { QuizId } from '../../../domain/quiz/entities/quiz';

export type QuestionFixtureParams = {
  id?: QuestionId;
  quizId?: QuizId;
  position?: number;
  questionText?: string;
  type?: QuestionType;
  answers?: QuestionAnswer[];
  timeLimit?: number;
  points?: number;
};

export const createQuestionFixture = (params: QuestionFixtureParams = {}): Question => {
  const questionId = params.id ?? (1 as QuestionId);
  const answers = params.answers ?? [
    new QuestionAnswer(1 as QuestionAnswerId, questionId, '4', 0, true),
    new QuestionAnswer(2 as QuestionAnswerId, questionId, '3', 1, false),
    new QuestionAnswer(3 as QuestionAnswerId, questionId, '5', 2, false),
    new QuestionAnswer(4 as QuestionAnswerId, questionId, '6', 3, false),
  ];

  return new Question(
    questionId,
    params.quizId ?? (1 as QuizId),
    params.position ?? 1,
    params.questionText ?? 'What is 2 + 2?',
    params.type ?? QuestionType.MULTIPLE,
    answers,
    params.timeLimit ?? 20,
    params.points ?? 1000,
  );
};
