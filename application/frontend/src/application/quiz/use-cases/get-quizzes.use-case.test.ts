import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetQuizzesUseCase } from "./get-quizzes.use-case";
import type { QuizRepository } from "../../../domains/quiz/ports/quiz.repository";
import type { Quiz } from "../../../domains/quiz/types";
import { createQuizFixture } from "../../../test/fixtures";
import { createQuizRepositoryMock } from "../../../test/mock-factories/quiz-repository.mock-factory";

describe("GetQuizzesUseCase", () => {
  let getQuizzesUseCase: GetQuizzesUseCase;
  let mockQuizRepository: QuizRepository;

  const mockQuizzes: Quiz[] = [
    createQuizFixture(),
    createQuizFixture(),
  ];

  beforeEach(() => {
    mockQuizRepository = createQuizRepositoryMock();

    getQuizzesUseCase = new GetQuizzesUseCase(mockQuizRepository);
  });

  it("should get all quizzes", async () => {
    vi.mocked(mockQuizRepository.getQuizzes).mockResolvedValue(mockQuizzes);

    const result = await getQuizzesUseCase.execute({ token: "test-token" });

    expect(result).toEqual(mockQuizzes);
    expect(mockQuizRepository.getQuizzes).toHaveBeenCalledWith("test-token");
  });

  it("should throw error when repository fails", async () => {
    vi.mocked(mockQuizRepository.getQuizzes).mockRejectedValue(
      new Error("Network error"),
    );

    await expect(
      getQuizzesUseCase.execute({ token: "test-token" }),
    ).rejects.toThrow("Network error");
  });

  it("should return empty array when no quizzes exist", async () => {
    vi.mocked(mockQuizRepository.getQuizzes).mockResolvedValue([]);

    const result = await getQuizzesUseCase.execute({ token: "test-token" });

    expect(result).toEqual([]);
  });
});

