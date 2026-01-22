import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateQuizUseCase } from "./create-quiz.use-case";
import type { QuizRepository } from "../../../domains/quiz/ports/quiz.repository";
import type { Quiz } from "../../../domains/quiz/types";
import { createQuizFixture } from "../../../test/fixtures";
import { QuizErrorCode } from "../enums/quiz-error-code.enum";
import { createQuizRepositoryMock } from "../../../test/mock-factories/quiz-repository.mock-factory";

describe("CreateQuizUseCase", () => {
  let createQuizUseCase: CreateQuizUseCase;
  let mockQuizRepository: QuizRepository;

  beforeEach(() => {
    mockQuizRepository = createQuizRepositoryMock();

    createQuizUseCase = new CreateQuizUseCase(mockQuizRepository);
  });

  it("should create quiz successfully", async () => {
    const mockQuiz: Quiz = createQuizFixture();

    vi.mocked(mockQuizRepository.createQuiz).mockResolvedValue(mockQuiz);

    const result = await createQuizUseCase.execute({
      token: "test-token",
      title: "Test Quiz",
      description: "Test Description",
      organizationId: 1,
    });

    expect(result).toEqual(mockQuiz);
    expect(mockQuizRepository.createQuiz).toHaveBeenCalledWith(
      "test-token",
      "Test Quiz",
      "Test Description",
      1,
    );
  });

  it("should throw error when title is empty", async () => {
    await expect(
      createQuizUseCase.execute({
        token: "test-token",
        title: "",
        description: "Test Description",
        organizationId: 1,
      }),
    ).rejects.toThrow(QuizErrorCode.QUIZ_TITLE_REQUIRED);

    expect(mockQuizRepository.createQuiz).not.toHaveBeenCalled();
  });

  it("should throw error when title is only whitespace", async () => {
    await expect(
      createQuizUseCase.execute({
        token: "test-token",
        title: "   ",
        description: "Test Description",
        organizationId: 1,
      }),
    ).rejects.toThrow(QuizErrorCode.QUIZ_TITLE_REQUIRED);

    expect(mockQuizRepository.createQuiz).not.toHaveBeenCalled();
  });
});

