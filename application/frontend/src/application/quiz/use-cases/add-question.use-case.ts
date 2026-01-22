import { QuizRepository } from "../../../domains/quiz/ports/quiz.repository";
import type { Question } from "../../../domains/quiz/types";
import type { CreateQuestionPayload } from "../../../domains/quiz/quiz.payloads";
import { QuizErrorCode } from "../enums/quiz-error-code.enum";

export interface AddQuestionRequest {
  token: string;
  questionData: CreateQuestionPayload;
}

/**
 * Add Question Use Case
 * Handles adding questions to a quiz
 * Following Clean Architecture and Single Responsibility Principle
 */
export class AddQuestionUseCase {
  constructor(private readonly quizRepository: QuizRepository) { }

  async execute(request: AddQuestionRequest): Promise<Question> {
    const { token, questionData } = request;

    // Business rule: validate required fields
    if (!questionData.questionText || questionData.questionText.trim().length === 0) {
      throw new Error(QuizErrorCode.QUESTION_TEXT_REQUIRED);
    }

    if (!questionData.quizId) {
      throw new Error(QuizErrorCode.QUIZ_ID_REQUIRED);
    }

    return this.quizRepository.addQuestion(token, questionData);
  }
}

