import React from "react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import type { GameSession } from "../../../../domains/game/types";
import type { Quiz } from "../../../../domains/quiz/types";
import {
  createGameSessionFixture,
  createQuizFixture,
} from "../../../../test/fixtures";

const mocks = vi.hoisted(() => ({
  useAuthManagerContext: vi.fn(),
  useQuizManagerContext: vi.fn(),
  useGameSessionContext: vi.fn(),
  useNotifications: vi.fn(),
  pageProps: null as Record<string, unknown> | null,
}));

vi.mock("../../auth", () => ({
  useAuthManagerContext: () => mocks.useAuthManagerContext(),
}));

vi.mock("../context/QuizManagerContext", () => ({
  useQuizManagerContext: () => mocks.useQuizManagerContext(),
}));

vi.mock("../../game/contexts/GameSessionContext", () => ({
  useGameSessionContext: () => mocks.useGameSessionContext(),
}));

vi.mock("../../app-shell", () => ({
  useNotifications: () => mocks.useNotifications(),
}));

vi.mock("../components/ManageQuizSessionsPage", () => ({
  ManageQuizSessionsPage: (props: Record<string, unknown>) => {
    mocks.pageProps = props;
    return <div data-testid="manage-quiz-sessions-page" />;
  },
}));

import { ManageQuizSessionsRoute } from "./ManageQuizSessionsRoute";

interface SetupOptions {
  auth?: {
    isAuthenticated?: boolean;
    isAdmin?: boolean;
  };
  quiz?: Partial<MockQuizContext>;
  gameSessions?: Partial<MockGameSessionContext>;
}

const defaultQuiz: Quiz = createQuizFixture({
  id: 99,
});

interface MockQuizContext {
  quizzes: Quiz[];
  hasLoadedQuizzes: boolean;
}

interface MockGameSessionContext {
  sessionsByQuiz: Record<number, GameSession[]>;
  loadSessionsForQuiz: ReturnType<typeof vi.fn>;
  rejoinSession: ReturnType<typeof vi.fn>;
}

function renderRoute(initialEntry = "/admin/quizzes/99/sessions") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/admin/quizzes/:quizId/sessions"
          element={<ManageQuizSessionsRoute />}
        />
        <Route path="/auth/login" element={<div>Login Page</div>} />
        <Route path="/admin" element={<div>Admin Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function setup({ auth, quiz, gameSessions }: SetupOptions = {}) {
  mocks.useAuthManagerContext.mockReturnValue({
    isAuthenticated: auth?.isAuthenticated ?? true,
    isAdmin: auth?.isAdmin ?? true,
  });

  const quizContext: MockQuizContext = {
    quizzes: quiz?.quizzes ?? [defaultQuiz],
    hasLoadedQuizzes: quiz?.hasLoadedQuizzes ?? true,
  };

  mocks.useQuizManagerContext.mockReturnValue(quizContext);

  const loadSessionsForQuiz =
    (gameSessions?.loadSessionsForQuiz as MockGameSessionContext["loadSessionsForQuiz"]) ??
    vi.fn().mockResolvedValue(undefined);

  const rejoinSession =
    (gameSessions?.rejoinSession as MockGameSessionContext["rejoinSession"]) ??
    vi.fn().mockResolvedValue(undefined);

  const gameSessionContext: MockGameSessionContext = {
    sessionsByQuiz: gameSessions?.sessionsByQuiz ?? {},
    loadSessionsForQuiz,
    rejoinSession,
  };

  mocks.useGameSessionContext.mockReturnValue(gameSessionContext);

  const notify = vi.fn();
  const notifyFromError = vi.fn();
  mocks.useNotifications.mockReturnValue({ notify, notifyFromError });

  return {
    quizContext,
    gameSessionContext,
    notify,
    notifyFromError,
  };
}

describe("ManageQuizSessionsRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pageProps = null;
  });

  it("redirects unauthenticated users to login", async () => {
    setup({ auth: { isAuthenticated: false, isAdmin: false } });

    renderRoute();

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
    expect(mocks.pageProps).toBeNull();
  });

  it("redirects to admin when quiz is missing after load", async () => {
    setup({
      quiz: {
        quizzes: [],
        hasLoadedQuizzes: true,
      },
    });

    renderRoute();

    expect(await screen.findByText("Admin Page")).toBeInTheDocument();
    expect(mocks.pageProps).toBeNull();
  });

  it("loads sessions when not cached", async () => {
    const { gameSessionContext } = setup({
      gameSessions: {
        sessionsByQuiz: {},
        loadSessionsForQuiz: vi.fn().mockResolvedValue(undefined),
      },
    });

    renderRoute();

    await waitFor(() => {
      expect(gameSessionContext.loadSessionsForQuiz).toHaveBeenCalledWith(99);
    });
  });

  it("provides refresh handler that loads sessions", async () => {
    const loadSessionsForQuiz = vi.fn().mockResolvedValue(undefined);
    setup({
      gameSessions: {
        sessionsByQuiz: { 99: [] },
        loadSessionsForQuiz,
        rejoinSession: vi.fn(),
      },
    });

    renderRoute();

    await waitFor(() => {
      expect(mocks.pageProps).not.toBeNull();
    });

    const props = mocks.pageProps as {
      onRefreshSessions: () => Promise<void>;
    };

    await props.onRefreshSessions();

    expect(loadSessionsForQuiz).toHaveBeenCalledWith(99);
  });

  it("provides rejoin handler that calls context", async () => {
    const rejoinSession = vi.fn().mockResolvedValue(undefined);
    const session: GameSession = createGameSessionFixture();

    setup({
      gameSessions: {
        sessionsByQuiz: { 99: [session] },
        loadSessionsForQuiz: vi.fn().mockResolvedValue(undefined),
        rejoinSession,
      },
    });

    renderRoute();

    await waitFor(() => {
      expect(mocks.pageProps).not.toBeNull();
    });

    const props = mocks.pageProps as {
      onRejoinSession: (value: GameSession) => Promise<void>;
    };

    await props.onRejoinSession(session);
    expect(rejoinSession).toHaveBeenCalledWith(session);
  });

  it("notifies when session load fails", async () => {
    const error = new Error("fail");
    const loadSessionsForQuiz = vi.fn().mockRejectedValue(error);
    const { notifyFromError } = setup({
      gameSessions: {
        sessionsByQuiz: {},
        loadSessionsForQuiz,
      },
    });

    renderRoute();

    await waitFor(() => {
      expect(notifyFromError).toHaveBeenCalledWith(
        error,
        "errors.sessionsLoadFailed"
      );
    });
  });
});
