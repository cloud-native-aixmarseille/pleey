import { IQuizRepository } from "../../domains/quiz/ports/quiz.repository.interface";
import type { Question } from "../../domains/quiz/types";

export interface AddQuestionRequest {
  token: string;
  questionData: Partial<Question>;
}

/**
 * Add Question Use Case
 * Handles adding questions to a quiz
 * Following Clean Architecture and Single Responsibility Principle
 */
export class AddQuestionUseCase {
  constructor(private readonly quizRepository: IQuizRepository) { }

  async execute(request: AddQuestionRequest): Promise<Question> {
    const { token, questionData } = request;

    // Business rule: validate required fields
    if (
      !questionData.question_text ||
      questionData.question_text.trim().length === 0
    ) {
      throw new Error("Question text is required");
    }

    if (!questionData.quiz_id) {
      throw new Error("Quiz ID is required");
    }

    return this.quizRepository.addQuestion(token, questionData);
  }
}

