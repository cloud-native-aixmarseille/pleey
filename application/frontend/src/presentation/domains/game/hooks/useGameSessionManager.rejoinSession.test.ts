import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import type { GameSession } from "../../../../domains/game/types";
import type { User } from "../../../../domains/auth/types";
import type { Quiz } from "../../../../domains/quiz/types/Quiz";
import type { Question } from "../../../../domains/quiz/types/Question";
import { resetGameSessionManagerMocks } from "./useGameSessionManager.mocks";
import { useGameSessionManager } from "./useGameSessionManager";

describe("useGameSessionManager (rejoinSession)", () => {
  beforeEach(() => {
    resetGameSessionManagerMocks();
  });

  it("navigates to playing when session is paused", async () => {
    const navigate = vi.fn();
    const user = { id: 7, username: "Host" } as unknown as User;
    const quiz: Quiz = {
      id: 1,
      title: "Quiz",
      description: null,
      createdById: 7,
      createdAt: "2026-01-19T00:00:00Z",
    };
    const question: Question = {
      id: 1,
      quizId: 1,
      position: 0,
      questionText: "Question?",
      type: "multiple",
      answers: [
        { id: 1, text: "A", position: 0, isCorrect: true },
        { id: 2, text: "B", position: 1, isCorrect: false },
      ],
      timeLimit: 10,
      points: 100,
    };

    const { result } = renderHook(() =>
      useGameSessionManager({
        token: "token",
        user,
        guestId: null,
        guestNickname: "",
        registerGuest: () => ({ id: "guest-123" }),
        quizzes: [quiz],
        questionsByQuiz: { 1: [question] },
        fetchQuizQuestions: vi.fn().mockResolvedValue([question]),
        notify: vi.fn(),
        notifyFromError: vi.fn(),
        navigate,
      })
    );

    const session = {
      pin: "ABC123",
      quizId: 1,
      status: "paused",
    } as unknown as GameSession;

    await act(async () => {
      await result.current.rejoinSession(session);
    });

    expect(navigate).toHaveBeenCalledWith("/game/ABC123/playing/current");
  });
});
