import React from "react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "../../../../domains/quiz/quiz.service";
import type { Quiz, Question } from "../../../../shared/types";

const mocks = vi.hoisted(() => ({
  useAuthManagerContext: vi.fn(),
  useQuizManagerContext: vi.fn(),
  useNotifications: vi.fn(),
  managePageProps: null as null | Record<string, unknown>,
}));

vi.mock("../../../../application/app/context/AuthManagerContext", () => ({
  useAuthManagerContext: () => mocks.useAuthManagerContext(),
}));

vi.mock("../../../../application/app/context/QuizManagerContext", () => ({
  useQuizManagerContext: () => mocks.useQuizManagerContext(),
}));

vi.mock("../../../../application/app/hooks/useNotifications", () => ({
  useNotifications: () => mocks.useNotifications(),
}));

vi.mock("../../components/ManageQuestionsPage", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mocks.managePageProps = props;
    return <div data-testid="manage-questions-page" />;
  },
}));

import { ManageQuestionsRoute } from "../ManageQuestionsRoute";

interface SetupOptions {
  auth?: {
    isAuthenticated?: boolean;
    isAdmin?: boolean;
    token?: string | null;
  };
  quiz?: Partial<MockQuizContext>;
}

const defaultQuiz: Quiz = {
  id: 42,
  title: "Neon Trivia",
  description: "Test quiz",
  created_by: 1,
  created_at: "2024-01-01T00:00:00.000Z",
};

interface MockQuizContext {
  quizzes: Quiz[];
  questionsByQuiz: Record<number, Question[]>;
  hasLoadedQuizzes: boolean;
  loadQuizQuestions: ReturnType<typeof vi.fn>;
  addQuestion: ReturnType<typeof vi.fn>;
  deleteQuestion: ReturnType<typeof vi.fn>;
  updateQuestion: ReturnType<typeof vi.fn>;
}

function renderRoute(initialEntry = "/admin/quizzes/42") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/admin/quizzes/:quizId" element={<ManageQuestionsRoute />} />
        <Route path="/auth/login" element={<div>Login Page</div>} />
        <Route path="/admin" element={<div>Admin Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function setup({ auth, quiz }: SetupOptions = {}) {
  const token = auth?.token ?? "token-abc";
  mocks.useAuthManagerContext.mockReturnValue({
    isAuthenticated: auth?.isAuthenticated ?? true,
    isAdmin: auth?.isAdmin ?? true,
    token,
  });

  const loadQuizQuestions = vi.fn().mockResolvedValue(undefined);
  const addQuestion = vi.fn().mockResolvedValue(undefined);
  const deleteQuestion = vi.fn().mockResolvedValue(undefined);
  const updateQuestion = vi.fn().mockResolvedValue(undefined);

  const quizContext: MockQuizContext = {
    quizzes: quiz?.quizzes ?? [defaultQuiz],
    questionsByQuiz: (quiz?.questionsByQuiz as Record<number, Question[]>) ?? {},
    hasLoadedQuizzes: quiz?.hasLoadedQuizzes ?? true,
    loadQuizQuestions: (quiz?.loadQuizQuestions as MockQuizContext["loadQuizQuestions"]) ?? loadQuizQuestions,
    addQuestion: (quiz?.addQuestion as MockQuizContext["addQuestion"]) ?? addQuestion,
    deleteQuestion: (quiz?.deleteQuestion as MockQuizContext["deleteQuestion"]) ?? deleteQuestion,
    updateQuestion: (quiz?.updateQuestion as MockQuizContext["updateQuestion"]) ?? updateQuestion,
  };

  mocks.useQuizManagerContext.mockReturnValue(quizContext);

  const notify = vi.fn();
  const notifyFromError = vi.fn();
  mocks.useNotifications.mockReturnValue({ notify, notifyFromError });

  return {
    token,
    quizContext,
    notify,
    notifyFromError,
  };
}

describe("ManageQuestionsRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.managePageProps = null;
  });

  it("redirects unauthenticated users to login", async () => {
    setup({ auth: { isAuthenticated: false, isAdmin: false, token: null } });

    renderRoute();

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
    expect(mocks.managePageProps).toBeNull();
  });

  it("redirects to admin when quiz is missing after data load", async () => {
    setup({
      quiz: {
        quizzes: [],
        hasLoadedQuizzes: true,
      },
    });

    renderRoute();

    expect(await screen.findByText("Admin Page")).toBeInTheDocument();
    expect(mocks.managePageProps).toBeNull();
  });

  it("triggers question load when cache is empty", async () => {
    const { token, quizContext } = setup({
      quiz: {
        questionsByQuiz: {},
        loadQuizQuestions: vi.fn().mockResolvedValue(undefined),
      },
    });

    renderRoute();

    await waitFor(() => {
      expect(quizContext.loadQuizQuestions).toHaveBeenCalledWith(token, 42);
    });
    expect(quizContext.loadQuizQuestions).toHaveBeenCalledTimes(1);
  });

  it("avoids loading questions when cache already populated", () => {
    const question = {
      id: 1,
      quiz_id: 42,
      question_text: "What is neon?",
      type: "truefalse",
      correct_answer: "true",
      option_a: null,
      option_b: null,
      option_c: null,
      option_d: null,
      time_limit: 20,
      points: 500,
    };

    const { quizContext } = setup({
      quiz: {
        questionsByQuiz: { 42: [question] },
        loadQuizQuestions: vi.fn(),
      },
    });

    renderRoute();

    expect(quizContext.loadQuizQuestions).not.toHaveBeenCalled();
  });

  it("delegates add question and shows success notification", async () => {
    const { quizContext, notify } = setup({
      quiz: {
        questionsByQuiz: { 42: [] },
      },
    });

    renderRoute();

    await waitFor(() => {
      expect(mocks.managePageProps).not.toBeNull();
    });

    const props = mocks.managePageProps as {
      onAddQuestion: (payload: CreateQuestionPayload) => Promise<unknown>;
    };

    const payload: CreateQuestionPayload = {
      quizId: 42,
      questionText: "Question?",
      type: "multiple",
      correctAnswer: "A",
    };

    await props.onAddQuestion(payload);

    expect(quizContext.addQuestion).toHaveBeenCalledWith("token-abc", payload);
    expect(notify).toHaveBeenCalledWith(
      "quiz.success.questionCreated",
      "success"
    );
  });

  it("handles add question errors via notifyFromError", async () => {
    const error = new Error("boom");
    const addQuestion = vi.fn().mockRejectedValue(error);
    const { notifyFromError } = setup({
      quiz: {
        addQuestion,
        questionsByQuiz: { 42: [] },
      },
    });

    renderRoute();

    await waitFor(() => {
      expect(mocks.managePageProps).not.toBeNull();
    });

    const props = mocks.managePageProps as {
      onAddQuestion: (payload: CreateQuestionPayload) => Promise<unknown>;
    };

    await props.onAddQuestion({
      quizId: 42,
      questionText: "fail",
      type: "truefalse",
      correctAnswer: "true",
    });

    expect(notifyFromError).toHaveBeenCalledWith(
      error,
      "errors.unableToLoadQuestions"
    );
  });

  it("delegates delete question and notifies", async () => {
    const deleteQuestion = vi.fn().mockResolvedValue(undefined);
    const { quizContext, notify } = setup({
      quiz: {
        deleteQuestion,
        questionsByQuiz: { 42: [] },
      },
    });

    renderRoute();

    await waitFor(() => {
      expect(mocks.managePageProps).not.toBeNull();
    });

    const props = mocks.managePageProps as {
      onDeleteQuestion: (id: number) => Promise<void>;
    };

    await props.onDeleteQuestion(123);

    expect(quizContext.deleteQuestion).toHaveBeenCalledWith(
      "token-abc",
      42,
      123
    );
    expect(notify).toHaveBeenCalledWith(
      "quiz.success.questionDeleted",
      "success"
    );
  });

  it("handles delete question errors", async () => {
    const error = new Error("nope");
    const deleteQuestion = vi.fn().mockRejectedValue(error);
    const { notifyFromError } = setup({
      quiz: {
        deleteQuestion,
        questionsByQuiz: { 42: [] },
      },
    });

    renderRoute();

    await waitFor(() => {
      expect(mocks.managePageProps).not.toBeNull();
    });

    const props = mocks.managePageProps as {
      onDeleteQuestion: (id: number) => Promise<void>;
    };

    await props.onDeleteQuestion(999);

    expect(notifyFromError).toHaveBeenCalledWith(
      error,
      "errors.questionDeleteFailed"
    );
  });

  it("delegates update question and notifies", async () => {
    const updateQuestion = vi.fn().mockResolvedValue(undefined);
    const { quizContext, notify } = setup({
      quiz: {
        updateQuestion,
        questionsByQuiz: { 42: [] },
      },
    });

    renderRoute();

    await waitFor(() => {
      expect(mocks.managePageProps).not.toBeNull();
    });

    const props = mocks.managePageProps as {
      onUpdateQuestion: (
        id: number,
        payload: UpdateQuestionPayload
      ) => Promise<unknown>;
    };

    await props.onUpdateQuestion(5, { questionText: "Updated" });

    expect(quizContext.updateQuestion).toHaveBeenCalledWith(
      "token-abc",
      42,
      5,
      { questionText: "Updated" }
    );
    expect(notify).toHaveBeenCalledWith(
      "quiz.success.questionUpdated",
      "success"
    );
  });

  it("handles update question errors", async () => {
    const error = new Error("update-failed");
    const updateQuestion = vi.fn().mockRejectedValue(error);
    const { notifyFromError } = setup({
      quiz: {
        updateQuestion,
        questionsByQuiz: { 42: [] },
      },
    });

    renderRoute();

    await waitFor(() => {
      expect(mocks.managePageProps).not.toBeNull();
    });

    const props = mocks.managePageProps as {
      onUpdateQuestion: (
        id: number,
        payload: UpdateQuestionPayload
      ) => Promise<unknown>;
    };

    await props.onUpdateQuestion(10, { questionText: "bad" });

    expect(notifyFromError).toHaveBeenCalledWith(
      error,
      "errors.questionUpdateFailed"
    );
  });
});
