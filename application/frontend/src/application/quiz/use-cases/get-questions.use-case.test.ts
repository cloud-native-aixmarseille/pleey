import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetQuestionsUseCase } from "./get-questions.use-case";
import type { QuizRepository } from "../../../domains/quiz/ports/quiz.repository";
import type { Question } from "../../../domains/quiz/types";
import { createQuestionFixture } from "../../../test/fixtures";
import { createQuizRepositoryMock } from "../../../test/mock-factories/quiz-repository.mock-factory";

describe("GetQuestionsUseCase", () => {
  let getQuestionsUseCase: GetQuestionsUseCase;
  let mockQuizRepository: QuizRepository;

  const mockQuestions: Question[] = [
    createQuestionFixture(),
  ];

  beforeEach(() => {
    mockQuizRepository = createQuizRepositoryMock();

    getQuestionsUseCase = new GetQuestionsUseCase(mockQuizRepository);
  });

  it("should get questions for a quiz", async () => {
    vi.mocked(mockQuizRepository.getQuestions).mockResolvedValue(mockQuestions);

    const result = await getQuestionsUseCase.execute({
      token: "test-token",
      quizId: 1,
    });

    expect(result).toEqual(mockQuestions);
    expect(mockQuizRepository.getQuestions).toHaveBeenCalledWith(
      "test-token",
      1,
    );
  });

  it("should throw error when repository fails", async () => {
    vi.mocked(mockQuizRepository.getQuestions).mockRejectedValue(
      new Error("Quiz not found"),
    );

    await expect(
      getQuestionsUseCase.execute({ token: "test-token", quizId: 999 }),
    ).rejects.toThrow("Quiz not found");
  });

  it("should return empty array when quiz has no questions", async () => {
    vi.mocked(mockQuizRepository.getQuestions).mockResolvedValue([]);

    const result = await getQuestionsUseCase.execute({
      token: "test-token",
      quizId: 1,
    });

    expect(result).toEqual([]);
  });
});

