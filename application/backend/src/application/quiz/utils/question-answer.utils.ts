import { BadRequestException } from '@nestjs/common';
import { VALID_MULTIPLE_CHOICE_OPTIONS } from '../../../domain/quiz/constants/question.constants';
import { QuestionType } from '../../../domain/quiz/entities/question';
import type {
  QuestionAnswer,
  QuestionAnswerId,
} from '../../../domain/quiz/entities/question-answer';
import { QuizErrorCode } from '../../../domain/quiz/enums/quiz-error-code.enum';
import type { QuestionAnswerInput } from '../../../domain/quiz/ports/question.repository';

export type NormalizedQuestionAnswer = {
  id: QuestionAnswerId;
  text: string | null;
  position: number;
  isCorrect: boolean;
};

export const normalizeAnswers = (answers: QuestionAnswerInput[]): NormalizedQuestionAnswer[] => {
  return answers.map((answer, index) => ({
    id: (answer.id ?? index) as QuestionAnswerId,
    text: answer.text?.trim() ?? null,
    position: answer.position ?? index,
    isCorrect: Boolean(answer.isCorrect),
  }));
};

export const normalizeDomainAnswers = (answers: QuestionAnswer[]): NormalizedQuestionAnswer[] => {
  return answers.map((answer) => ({
    id: answer.id,
    text: answer.text?.trim() ?? null,
    position: answer.position,
    isCorrect: answer.isCorrect,
  }));
};

export const validateAnswers = (type: QuestionType, answers: NormalizedQuestionAnswer[]): void => {
  if (answers.length < 2) {
    throw new BadRequestException(QuizErrorCode.INVALID_CORRECT_ANSWER);
  }

  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  if (correctCount < 1) {
    throw new BadRequestException(QuizErrorCode.INVALID_CORRECT_ANSWER);
  }

  const positions = answers.map((answer) => answer.position);
  const uniquePositions = new Set(positions);

  if (uniquePositions.size !== positions.length) {
    throw new BadRequestException(QuizErrorCode.INVALID_CORRECT_ANSWER);
  }

  if (type === QuestionType.MULTIPLE) {
    if (answers.length > VALID_MULTIPLE_CHOICE_OPTIONS.length) {
      throw new BadRequestException(QuizErrorCode.INVALID_CORRECT_ANSWER);
    }

    if (correctCount < 1) {
      throw new BadRequestException(QuizErrorCode.INVALID_CORRECT_ANSWER);
    }

    for (const answer of answers) {
      if (answer.position < 0 || answer.position >= VALID_MULTIPLE_CHOICE_OPTIONS.length) {
        throw new BadRequestException(QuizErrorCode.INVALID_CORRECT_ANSWER);
      }
      if (!answer.text || !answer.text.trim()) {
        throw new BadRequestException(QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY);
      }
    }
  }

  if (type === QuestionType.TRUE_FALSE) {
    if (answers.length !== 2) {
      throw new BadRequestException(QuizErrorCode.INVALID_CORRECT_ANSWER);
    }
    if (correctCount !== 1) {
      throw new BadRequestException(QuizErrorCode.INVALID_CORRECT_ANSWER);
    }
    const allowedPositions = new Set([0, 1]);
    for (const answer of answers) {
      if (!allowedPositions.has(answer.position)) {
        throw new BadRequestException(QuizErrorCode.INVALID_CORRECT_ANSWER);
      }
    }
  }
};
