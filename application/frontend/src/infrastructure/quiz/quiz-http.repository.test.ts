import { describe, it, expect, beforeEach, vi } from "vitest";
import { QuizHttpRepository } from "./quiz-http.repository";
import type { Quiz, Question } from "../../domains/quiz/types";
import type { CreateQuestionPayload } from "../../domains/quiz/quiz.payloads";
import { createQuestionFixture, createQuizFixture } from "../../test/fixtures";

const mocks = vi.hoisted(() => ({
  fetchClientPostMock: vi.fn(),
  queryOptionsMock: vi.fn(),
  queryClientFetchQueryMock: vi.fn(),
  queryClientInvalidateMock: vi.fn(),
}));

vi.mock("../shared/http/api/openapiClient", () => ({
  apiClient: {
    queryOptions: mocks.queryOptionsMock,
  },
  fetchClient: {
    POST: mocks.fetchClientPostMock,
  },
  queryClient: {
    fetchQuery: mocks.queryClientFetchQueryMock,
    invalidateQueries: mocks.queryClientInvalidateMock,
  },
}));

// Mock fetch
globalThis.fetch = vi.fn();

describe("QuizHttpRepository", () => {
  let repository: QuizHttpRepository;

  beforeEach(() => {
    repository = new QuizHttpRepository();
    vi.clearAllMocks();
    mocks.fetchClientPostMock.mockReset();
    mocks.queryOptionsMock.mockReset();
    mocks.queryClientFetchQueryMock.mockReset();
    mocks.queryClientInvalidateMock.mockReset();
  });

  describe("getQuizzes", () => {
    it("should fetch all quizzes", async () => {
      const mockQuizzes: Quiz[] = [
        createQuizFixture(),
      ];

      const queryOptions = { path: "/api/quizzes" };
      mocks.queryOptionsMock.mockReturnValueOnce(queryOptions);
      mocks.queryClientFetchQueryMock.mockResolvedValueOnce(mockQuizzes);

      const result = await repository.getQuizzes("test-token");

      expect(result).toEqual(mockQuizzes);
      expect(mocks.queryOptionsMock).toHaveBeenCalledWith(
        "get",
        "/api/quizzes",
      );
      expect(mocks.queryClientFetchQueryMock).toHaveBeenCalledWith(
        queryOptions,
      );
    });

    it("should invalidate cache when force is true", async () => {
      const queryOptions = { path: "/api/quizzes" };
      mocks.queryOptionsMock.mockReturnValueOnce(queryOptions);
      mocks.queryClientFetchQueryMock.mockResolvedValueOnce([]);

      await repository.getQuizzes("test-token", { force: true });

      expect(mocks.queryClientInvalidateMock).toHaveBeenCalledWith({
        queryKey: ["get", "/api/quizzes"],
      });
    });
  });

  describe("getQuestions", () => {
    it("should fetch questions for a quiz", async () => {
      const mockQuestions: Question[] = [
        createQuestionFixture(),
      ];

      const queryOptions = { path: "/api/quizzes/{quizId}/questions" };
      mocks.queryOptionsMock.mockReturnValueOnce(queryOptions);
      mocks.queryClientFetchQueryMock.mockResolvedValueOnce(mockQuestions);

      const result = await repository.getQuestions("test-token", 1);

      expect(result).toEqual(mockQuestions);
      expect(mocks.queryOptionsMock).toHaveBeenCalledWith(
        "get",
        "/api/quizzes/{quizId}/questions",
        {
          params: {
            path: {
              quizId: 1,
            },
          },
        },
      );
      expect(mocks.queryClientFetchQueryMock).toHaveBeenCalledWith(
        queryOptions,
      );
    });
  });

  describe("createQuiz", () => {
    it("should create a quiz", async () => {
      const mockQuiz: Quiz = createQuizFixture();

      mocks.fetchClientPostMock.mockResolvedValueOnce({
        data: mockQuiz,
        error: null,
      });

      const result = await repository.createQuiz(
        "test-token",
        "New Quiz",
        "New Description",
        1,
      );

      expect(result).toEqual(mockQuiz);
      expect(mocks.fetchClientPostMock).toHaveBeenCalledWith(
        "/api/quizzes",
        expect.objectContaining({
          body: {
            title: "New Quiz",
            description: "New Description",
            organizationId: 1,
          },
        }),
      );
      expect(mocks.queryClientInvalidateMock).toHaveBeenCalledWith({
        queryKey: ["get", "/api/quizzes"],
      });
    });
  });

  describe("addQuestion", () => {
    it("should add a question", async () => {
      const mockQuestion: Question = createQuestionFixture();

      const questionData: CreateQuestionPayload = {
        quizId: 1,
        questionText: "What is 2+2?",
        type: "multiple",
        answers: [{ text: "4", isCorrect: true }],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuestion,
      } as Response);

      const result = await repository.addQuestion("test-token", questionData);

      expect(result).toEqual(mockQuestion);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/questions"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify(questionData),
      });
      expect(mocks.queryClientInvalidateMock).toHaveBeenCalledWith({
        queryKey: ["get", "/api/quizzes"],
      });
    });
  });
});

