import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddQuestionUseCase } from "./add-question.use-case";
import type { QuizRepository } from "../../../domains/quiz/ports/quiz.repository";
import type { Question } from "../../../domains/quiz/types";
import type { CreateQuestionPayload } from "../../../domains/quiz/quiz.payloads";
import { createQuestionFixture } from "../../../test/fixtures";
import { QuizErrorCode } from "../enums/quiz-error-code.enum";
import { createQuizRepositoryMock } from "../../../test/mock-factories/quiz-repository.mock-factory";

describe("AddQuestionUseCase", () => {
  let addQuestionUseCase: AddQuestionUseCase;
  let mockQuizRepository: QuizRepository;

  const mockQuestion: Question = createQuestionFixture();

  beforeEach(() => {
    mockQuizRepository = createQuizRepositoryMock();

    addQuestionUseCase = new AddQuestionUseCase(mockQuizRepository);
  });

  it("should add question successfully", async () => {
    vi.mocked(mockQuizRepository.addQuestion).mockResolvedValue(mockQuestion);

    const questionData: CreateQuestionPayload = {
      quizId: 1,
      questionText: "What is 2+2?",
      type: "multiple",
      answers: [{ text: "4", isCorrect: true }],
    };

    const result = await addQuestionUseCase.execute({
      token: "test-token",
      questionData,
    });

    expect(result).toEqual(mockQuestion);
    expect(mockQuizRepository.addQuestion).toHaveBeenCalledWith(
      "test-token",
      questionData,
    );
  });

  it("should throw error when question text is empty", async () => {
    await expect(
      addQuestionUseCase.execute({
        token: "test-token",
        questionData: {
          quizId: 1,
          questionText: "",
          type: "multiple",
          answers: [{ text: "4", isCorrect: true }],
        },
      }),
    ).rejects.toThrow(QuizErrorCode.QUESTION_TEXT_REQUIRED);

    expect(mockQuizRepository.addQuestion).not.toHaveBeenCalled();
  });

  it("should throw error when question text is whitespace", async () => {
    await expect(
      addQuestionUseCase.execute({
        token: "test-token",
        questionData: {
          quizId: 1,
          questionText: "   ",
          type: "multiple",
          answers: [{ text: "4", isCorrect: true }],
        },
      }),
    ).rejects.toThrow(QuizErrorCode.QUESTION_TEXT_REQUIRED);

    expect(mockQuizRepository.addQuestion).not.toHaveBeenCalled();
  });

  it("should throw error when quizId is missing", async () => {
    const invalidQuestionData = {
      questionText: "What is 2+2?",
      type: "multiple",
      answers: [{ text: "4", isCorrect: true }],
    } as unknown as CreateQuestionPayload;

    await expect(
      addQuestionUseCase.execute({
        token: "test-token",
        questionData: invalidQuestionData,
      }),
    ).rejects.toThrow(QuizErrorCode.QUIZ_ID_REQUIRED);

    expect(mockQuizRepository.addQuestion).not.toHaveBeenCalled();
  });
});

