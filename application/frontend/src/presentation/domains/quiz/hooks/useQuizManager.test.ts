import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useQuizManager } from "./useQuizManager";
import { quizService } from "../../../../domains/quiz/quiz.service";

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
     
    quizService.getQuizzes.mockResolvedValueOnce([
      {
        id: 1,
        title: "Quiz",
        description: null,
        created_by: 1,
        created_at: new Date().toISOString(),
        question_count: 0,
        is_active: false,
      },
    ]);

     
    quizService.addQuestion.mockResolvedValueOnce({
      id: 10,
      quiz_id: 1,
      question_text: "Q?",
      type: "multiple",
      correct_answer: "A",
      option_a: "A",
      option_b: "B",
      option_c: null,
      option_d: null,
      time_limit: 20,
      points: 100,
    });

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
     
    quizService.getQuizzes.mockResolvedValueOnce([
      {
        id: 1,
        title: "Quiz",
        description: null,
        created_by: 1,
        created_at: new Date().toISOString(),
        question_count: 1,
        is_active: false,
      },
    ]);

     
    quizService.deleteQuestion.mockResolvedValueOnce(undefined);

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
          {
            id: 10,
            quiz_id: 1,
            question_text: "Q?",
            type: "multiple",
            correct_answer: "A",
            option_a: "A",
            option_b: "B",
            option_c: null,
            option_d: null,
            time_limit: 20,
            points: 100,
          },
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
