import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useQuizManager } from "./useQuizManager";
import { quizService } from "../../../../domains/quiz/quiz.service";
import type { Question } from "../../../../domains/quiz/types";
import { createQuestionFixture, createQuizFixture } from "../../../../test/fixtures";

vi.mock("../../../../domains/quiz/quiz.service", () => ({
  quizService: {
    getQuizzes: vi.fn(),
    getQuestions: vi.fn(),
    addQuestion: vi.fn(),
    deleteQuestion: vi.fn(),
    updateQuestion: vi.fn(),
    createQuiz: vi.fn(),
    deleteQuiz: vi.fn(),
  },
}));

describe("useQuizManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should increment quiz.question_count when adding a question", async () => {
    vi.mocked(quizService.getQuizzes).mockResolvedValueOnce([
      createQuizFixture(),
    ]);
    vi.mocked(quizService.addQuestion).mockResolvedValueOnce(
      createQuestionFixture(),
    );

    const { result } = renderHook(() => useQuizManager());

    await act(async () => {
      await result.current.loadQuizzes("token");
    });

    await waitFor(() => {
      expect(result.current.quizzes).toHaveLength(1);
      expect(result.current.quizzes[0].question_count).toBe(0);
    });

    await act(async () => {
      await result.current.addQuestion("token", {
        quizId: 1,
        questionText: "Q?",
        type: "multiple",
        correctAnswer: "A",
        optionA: "A",
        optionB: "B",
      });
    });

    await waitFor(() => {
      expect(result.current.quizzes[0].question_count).toBe(1);
    });
  });

  it("should increment quiz.question_count when addQuestion returns quiz_id as a string", async () => {
    vi.mocked(quizService.getQuizzes).mockResolvedValueOnce([
      createQuizFixture(),
    ]);
    vi.mocked(quizService.addQuestion).mockResolvedValueOnce(
      {
        ...createQuestionFixture(),
        quiz_id: "1",
      } as unknown as Question,
    );

    const { result } = renderHook(() => useQuizManager());

    await act(async () => {
      await result.current.loadQuizzes("token");
    });

    await waitFor(() => {
      expect(result.current.quizzes).toHaveLength(1);
      expect(result.current.quizzes[0].question_count).toBe(0);
    });

    await act(async () => {
      await result.current.addQuestion("token", {
        quizId: 1,
        questionText: "Q?",
        type: "multiple",
        correctAnswer: "A",
        optionA: "A",
        optionB: "B",
      });
    });

    await waitFor(() => {
      expect(result.current.quizzes[0].question_count).toBe(1);
    });
  });

  it("should decrement quiz.question_count when deleting a question", async () => {
    vi.mocked(quizService.getQuizzes).mockResolvedValueOnce([
      createQuizFixture({
        question_count: 1,
      }),
    ]);
    vi.mocked(quizService.deleteQuestion).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useQuizManager());

    await act(async () => {
      await result.current.loadQuizzes("token");
    });

    await waitFor(() => {
      expect(result.current.quizzes).toHaveLength(1);
      expect(result.current.quizzes[0].question_count).toBe(1);
    });

    act(() => {
      result.current.setQuestionsByQuiz({
        1: [
          createQuestionFixture({ id: 10 }),
        ],
      });
    });

    await act(async () => {
      await result.current.deleteQuestion("token", 1, 10);
    });

    await waitFor(() => {
      expect(result.current.quizzes[0].question_count).toBe(0);
    });
  });
});
