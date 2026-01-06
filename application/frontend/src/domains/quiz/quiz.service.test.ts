import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "./quiz.service";

const mocks = vi.hoisted(() => ({
  queryOptionsMock: vi.fn(),
  fetchClientPostMock: vi.fn(),
  queryClientFetchQueryMock: vi.fn(),
  queryClientInvalidateMock: vi.fn(),
}));

vi.mock("../../infrastructure/http/api/openapiClient", () => ({
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

const globalFetchMock = vi.fn();
globalThis.fetch = globalFetchMock as unknown as typeof fetch;

// Import after mocks are registered
import { quizService } from "./quiz.service";

describe("QuizService", () => {
  const mockToken = "mock-jwt-token";

  beforeEach(() => {
    vi.clearAllMocks();
    globalFetchMock.mockReset();
    mocks.queryOptionsMock.mockReset();
    mocks.fetchClientPostMock.mockReset();
    mocks.queryClientFetchQueryMock.mockReset();
    mocks.queryClientInvalidateMock.mockReset();
  });

  describe("getQuizzes", () => {
    it("should fetch all quizzes", async () => {
      const mockQuizzes = [
        {
          id: 1,
          title: "Quiz 1",
          description: "Test quiz 1",
          created_by: 1,
          created_at: "2024-01-01",
        },
        {
          id: 2,
          title: "Quiz 2",
          description: "Test quiz 2",
          created_by: 1,
          created_at: "2024-01-02",
        },
      ];

      const queryOptions = { path: "/api/quizzes" };
      mocks.queryOptionsMock.mockReturnValueOnce(queryOptions);
      mocks.queryClientFetchQueryMock.mockResolvedValueOnce(mockQuizzes);

      const result = await quizService.getQuizzes(mockToken);

      expect(mocks.queryOptionsMock).toHaveBeenCalledWith(
        "get",
        "/api/quizzes",
      );
      expect(mocks.queryClientFetchQueryMock).toHaveBeenCalledWith(
        queryOptions,
      );
      expect(result).toEqual(mockQuizzes);
    });
  });

  describe("createQuiz", () => {
    it("should create a new quiz and invalidate cache", async () => {
      const newQuiz = {
        id: 3,
        title: "New Quiz",
        description: "New description",
        created_by: 1,
        created_at: "2024-01-03",
      };

      mocks.fetchClientPostMock.mockResolvedValueOnce({
        data: newQuiz,
        error: null,
      });

      const result = await quizService.createQuiz(
        mockToken,
        "New Quiz",
        "New description",
        10,
      );

      expect(mocks.fetchClientPostMock).toHaveBeenCalledWith("/api/quizzes", {
        body: {
          title: "New Quiz",
          description: "New description",
          organizationId: 10,
        },
        headers: {
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        },
      });
      expect(mocks.queryClientInvalidateMock).toHaveBeenCalledWith({
        queryKey: ["get", "/api/quizzes"],
      });
      expect(result).toEqual(newQuiz);
    });
  });

  describe("getQuestions", () => {
    it("should fetch questions for a quiz", async () => {
      const mockQuestions = [
        {
          id: 1,
          quiz_id: 1,
          question_text: "What is 2+2?",
          type: "multiple",
          correct_answer: "A",
          option_a: "4",
          option_b: "3",
          option_c: "5",
          option_d: "6",
          time_limit: 20,
          points: 1000,
        },
      ];

      const queryOptions = { path: "/api/quizzes/1/questions" };
      mocks.queryOptionsMock.mockReturnValueOnce(queryOptions);
      mocks.queryClientFetchQueryMock.mockResolvedValueOnce(mockQuestions);

      const result = await quizService.getQuestions(mockToken, 1);

      expect(mocks.queryOptionsMock).toHaveBeenCalledWith(
        "get",
        "/api/quizzes/{quizId}/questions",
        {
          params: { path: { quizId: 1 } },
        },
      );
      expect(mocks.queryClientFetchQueryMock).toHaveBeenCalledWith(
        queryOptions,
      );
      expect(result).toEqual(mockQuestions);
    });
  });

  describe("addQuestion", () => {
    it("should add a question to a quiz and return created question", async () => {
      const payload: CreateQuestionPayload = {
        quizId: 1,
        questionText: "New question?",
        type: "multiple",
        correctAnswer: "A",
        optionA: "Answer A",
        optionB: "Answer B",
        optionC: "Answer C",
        optionD: "Answer D",
        timeLimit: 20,
        points: 1000,
      };

      const createdQuestion = {
        id: 10,
        quiz_id: 1,
        question_text: "New question?",
        type: "multiple",
        correct_answer: "A",
        option_a: "Answer A",
        option_b: "Answer B",
        option_c: "Answer C",
        option_d: "Answer D",
        time_limit: 20,
        points: 1000,
      };

      globalFetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => createdQuestion,
      });

      const result = await quizService.addQuestion(mockToken, payload);

      expect(globalFetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/questions"),
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: `Bearer ${mockToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quiz_id: 1,
            question_text: "New question?",
            type: "multiple",
            correct_answer: "A",
            option_a: "Answer A",
            option_b: "Answer B",
            option_c: "Answer C",
            option_d: "Answer D",
            time_limit: 20,
            points: 1000,
          }),
        }),
      );
      expect(result).toEqual(createdQuestion);
    });
  });

  describe("deleteQuiz", () => {
    it("should delete a quiz", async () => {
      globalFetchMock.mockResolvedValueOnce({ ok: true });

      await quizService.deleteQuiz(mockToken, 1);

      expect(globalFetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/quizzes/1"),
        expect.objectContaining({
          method: "DELETE",
          headers: { Authorization: `Bearer ${mockToken}` },
        }),
      );
    });
  });

  describe("deleteQuestion", () => {
    it("should delete a question", async () => {
      globalFetchMock.mockResolvedValueOnce({ ok: true });

      await quizService.deleteQuestion(mockToken, 1);

      expect(globalFetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/questions/1"),
        expect.objectContaining({
          method: "DELETE",
          headers: { Authorization: `Bearer ${mockToken}` },
        }),
      );
    });
  });

  describe("updateQuestion", () => {
    it("should update a question and return the payload", async () => {
      const payload: UpdateQuestionPayload = {
        questionText: "Updated",
        points: 1500,
      };

      const updatedQuestion = {
        id: 5,
        quiz_id: 2,
        question_text: "Updated",
        type: "truefalse",
        correct_answer: "true",
        option_a: null,
        option_b: null,
        option_c: null,
        option_d: null,
        time_limit: 30,
        points: 1500,
      };

      globalFetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedQuestion,
      });

      const result = await quizService.updateQuestion(mockToken, 5, payload);

      expect(globalFetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/questions/5"),
        expect.objectContaining({
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${mockToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question_text: "Updated",
            points: 1500,
          }),
        }),
      );
      expect(result).toEqual(updatedQuestion);
    });
  });
});
