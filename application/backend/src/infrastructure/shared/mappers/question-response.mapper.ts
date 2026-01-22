import type { Question } from '../../../domain/quiz/entities/question';
import type { QuestionAnswerId } from '../../../domain/quiz/entities/question-answer';
import type { QuizId } from '../../../domain/quiz/entities/quiz';

export type QuestionAnswerResponse = {
  id: QuestionAnswerId;
  text: string | null;
  position: number;
  isCorrect: boolean;
};

export type QuestionResponse = {
  id: Question['id'];
  quizId: QuizId;
  position: number;
  questionText: string;
  type: Question['type'];
  answers: QuestionAnswerResponse[];
  timeLimit: number;
  points: number;
};

export const mapQuestionAnswerToResponse = (
  answer: Question['answers'][number],
): QuestionAnswerResponse => ({
  id: answer.id,
  text: answer.text,
  position: answer.position,
  isCorrect: answer.isCorrect,
});

export const mapQuestionToResponse = (question: Question): QuestionResponse => ({
  id: question.id,
  quizId: question.quizId,
  position: question.position,
  questionText: question.questionText,
  type: question.type,
  answers: question.answers.map(mapQuestionAnswerToResponse),
  timeLimit: question.timeLimit,
  points: question.points,
});
