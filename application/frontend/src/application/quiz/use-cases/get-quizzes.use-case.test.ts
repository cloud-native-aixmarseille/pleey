import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetQuizzesUseCase } from "./get-quizzes.use-case";
import { IQuizRepository } from "../../../domains/quiz/ports/quiz.repository.interface";
import type { Quiz } from "../../../domains/quiz/types";
import { createQuizFixture } from "../../../test/fixtures";

describe("GetQuizzesUseCase", () => {
  let getQuizzesUseCase: GetQuizzesUseCase;
  let mockQuizRepository: IQuizRepository;

  const mockQuizzes: Quiz[] = [
    createQuizFixture(),
    createQuizFixture(),
  ];

  beforeEach(() => {
    mockQuizRepository = {
      getQuizzes: vi.fn(),
      getQuestions: vi.fn(),
      createQuiz: vi.fn(),
      addQuestion: vi.fn(),
    };

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

