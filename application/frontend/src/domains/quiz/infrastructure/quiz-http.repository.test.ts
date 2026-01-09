import { describe, it, expect, beforeEach, vi } from "vitest";
import { QuizHttpRepository } from "./quiz-http.repository";
import type { Quiz, Question } from "../types";
import { createQuestionFixture, createQuizFixture } from "../../../test/fixtures";

// Mock fetch
globalThis.fetch = vi.fn();

describe("QuizHttpRepository", () => {
  let repository: QuizHttpRepository;

  beforeEach(() => {
    repository = new QuizHttpRepository("http://localhost:3001");
    vi.clearAllMocks();
  });

  describe("getQuizzes", () => {
    it("should fetch all quizzes", async () => {
      const mockQuizzes: Quiz[] = [
        createQuizFixture(),
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuizzes,
      } as Response);

      const result = await repository.getQuizzes("test-token");

      expect(result).toEqual(mockQuizzes);
      expect(fetch).toHaveBeenCalledWith("http://localhost:3001/api/quiz", {
        headers: { Authorization: "Bearer test-token" },
      });
    });

    it("should throw error when fetch fails", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(repository.getQuizzes("test-token")).rejects.toThrow(
        "Failed to fetch quizzes",
      );
    });
  });

  describe("getQuestions", () => {
    it("should fetch questions for a quiz", async () => {
      const mockQuestions: Question[] = [
        createQuestionFixture(),
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuestions,
      } as Response);

      const result = await repository.getQuestions("test-token", 1);

      expect(result).toEqual(mockQuestions);
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/quiz/1/questions",
        {
          headers: { Authorization: "Bearer test-token" },
        },
      );
    });
  });

  describe("createQuiz", () => {
    it("should create a quiz", async () => {
      const mockQuiz: Quiz = createQuizFixture();

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuiz,
      } as Response);

      const result = await repository.createQuiz(
        "test-token",
        "New Quiz",
        "New Description",
      );

      expect(result).toEqual(mockQuiz);
      expect(fetch).toHaveBeenCalledWith("http://localhost:3001/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          title: "New Quiz",
          description: "New Description",
        }),
      });
    });
  });

  describe("addQuestion", () => {
    it("should add a question", async () => {
      const mockQuestion: Question = createQuestionFixture();

      const questionData: Partial<Question> = {
        quiz_id: 1,
        question_text: "What is 2+2?",
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuestion,
      } as Response);

      const result = await repository.addQuestion("test-token", questionData);

      expect(result).toEqual(mockQuestion);
      expect(fetch).toHaveBeenCalledWith("http://localhost:3001/api/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify(questionData),
      });
    });
  });
});

