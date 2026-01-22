import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  quizRepositoryMock,
  resetQuizManagerMocks,
} from "../../../../test/mock-factories/quiz-manager.mocks";
import { useQuizManager } from "./useQuizManager";
import type { Question } from "../../../../domains/quiz/types";
import { createQuestionFixture, createQuizFixture } from "../../../../test/fixtures";

describe("useQuizManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetQuizManagerMocks();
  });

  it("should increment quiz.questionCount when adding a question", async () => {
    quizRepositoryMock.getQuizzes.mockResolvedValueOnce([
      createQuizFixture(),
    ]);
    quizRepositoryMock.addQuestion.mockResolvedValueOnce(
      createQuestionFixture(),
    );

    const { result } = renderHook(() => useQuizManager());

    await act(async () => {
      await result.current.loadQuizzes("token");
    });

    await waitFor(() => {
      expect(result.current.quizzes).toHaveLength(1);
      expect(result.current.quizzes[0].questionCount).toBe(0);
    });

    await act(async () => {
      await result.current.addQuestion("token", {
        quizId: 1,
        questionText: "Q?",
        type: "multiple",
        answers: [
          { id: 1, text: "A", position: 0, isCorrect: true },
          { id: 2, text: "B", position: 1, isCorrect: false },
        ],
      });
    });

    await waitFor(() => {
      expect(result.current.quizzes[0].questionCount).toBe(1);
    });
  });

  it("should increment quiz.questionCount when addQuestion returns quizId as a string", async () => {
    quizRepositoryMock.getQuizzes.mockResolvedValueOnce([
      createQuizFixture(),
    ]);
    quizRepositoryMock.addQuestion.mockResolvedValueOnce(
      {
        ...createQuestionFixture(),
        quizId: "1",
      } as unknown as Question,
    );

    const { result } = renderHook(() => useQuizManager());

    await act(async () => {
      await result.current.loadQuizzes("token");
    });

    await waitFor(() => {
      expect(result.current.quizzes).toHaveLength(1);
      expect(result.current.quizzes[0].questionCount).toBe(0);
    });

    await act(async () => {
      await result.current.addQuestion("token", {
        quizId: 1,
        questionText: "Q?",
        type: "multiple",
        answers: [
          { id: 1, text: "A", position: 0, isCorrect: true },
          { id: 2, text: "B", position: 1, isCorrect: false },
        ],
      });
    });

    await waitFor(() => {
      expect(result.current.quizzes[0].questionCount).toBe(1);
    });
  });

  it("should decrement quiz.questionCount when deleting a question", async () => {
    quizRepositoryMock.getQuizzes.mockResolvedValueOnce([
      createQuizFixture({
        questionCount: 1,
      }),
    ]);
    quizRepositoryMock.deleteQuestion.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useQuizManager());

    await act(async () => {
      await result.current.loadQuizzes("token");
    });

    await waitFor(() => {
      expect(result.current.quizzes).toHaveLength(1);
      expect(result.current.quizzes[0].questionCount).toBe(1);
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
      expect(result.current.quizzes[0].questionCount).toBe(0);
    });
  });
});
