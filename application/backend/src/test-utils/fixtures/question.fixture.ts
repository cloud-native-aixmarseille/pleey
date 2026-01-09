import { Question } from '../../domain/quiz/entities/question';

export type QuestionFixtureParams = {
  id?: number;
  quizId?: number;
  questionText?: string;
  type?: 'multiple' | 'truefalse';
  correctAnswer?: string;
  optionA?: string | null;
  optionB?: string | null;
  optionC?: string | null;
  optionD?: string | null;
  timeLimit?: number;
  points?: number;
};

export const createQuestionFixture = (params: QuestionFixtureParams = {}): Question => {
  return new Question(
    params.id ?? 1,
    params.quizId ?? 1,
    params.questionText ?? 'What is 2 + 2?',
    params.type ?? 'multiple',
    params.correctAnswer ?? 'A',
    params.optionA !== undefined ? params.optionA : '4',
    params.optionB !== undefined ? params.optionB : '3',
    params.optionC !== undefined ? params.optionC : null,
    params.optionD !== undefined ? params.optionD : null,
    params.timeLimit ?? 20,
    params.points ?? 1000,
  );
};
