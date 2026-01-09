import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminDashboard from "./AdminDashboard";
import { NotificationProvider } from "../../app-shell/contexts/NotificationContext";
import type { GameSession } from "../../../../domains/game/types";
import {
  createGameSessionFixture,
  createQuizFixture,
  createUserFixture,
} from "../../../../test/fixtures";

const organizationContextMock = vi.hoisted(() => ({
  useOrganization: vi.fn(),
}));

const authContextMock = vi.hoisted(() => ({
  useAuthManagerContext: vi.fn(),
}));

vi.mock("../context/OrganizationContext", () => ({
  useOrganization: organizationContextMock.useOrganization,
}));

vi.mock("../../auth", () => ({
  useAuthManagerContext: authContextMock.useAuthManagerContext,
}));

describe("AdminDashboard", () => {
  const mockQuizzes = [
    createQuizFixture({
      id: 1,
      title: "Quiz 1",
      description: "Description 1",
      question_count: 3,
    }),
    createQuizFixture({
      id: 2,
      title: "Quiz 2",
      description: "Description 2",
      question_count: 5,
    }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    organizationContextMock.useOrganization.mockReturnValue({
      organizations: [],
      currentOrganization: { id: 1, name: "Org 1" },
      dashboard: null,
      isLoading: false,
      error: null,
      setCurrentOrganization: vi.fn(),
      loadOrganizations: vi.fn(),
      loadDashboard: vi.fn(),
      createOrganization: vi.fn(),
      clearError: vi.fn(),
    });
    authContextMock.useAuthManagerContext.mockReturnValue({
      user: createUserFixture({ isAdmin: true }),
    });
  });

  it("should render admin dashboard with title", () => {
    const mockHandlers = {
      onCreateQuiz: vi.fn(),
      onManageQuiz: vi.fn(),
      onLaunchQuiz: vi.fn(),
      onJoinSession: vi.fn(),
    };

    render(
      <NotificationProvider>
        <AdminDashboard
          quizzes={[]}
          activeSessions={[]}
          {...mockHandlers}
          onDeleteQuiz={vi.fn()}
        />
      </NotificationProvider>
    );

    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Quiz/i)).toBeInTheDocument();
  });

  it("should display list of quizzes", () => {
    const mockHandlers = {
      onCreateQuiz: vi.fn(),
      onManageQuiz: vi.fn(),
      onLaunchQuiz: vi.fn(),
      onJoinSession: vi.fn(),
    };

    render(
      <NotificationProvider>
        <AdminDashboard
          quizzes={mockQuizzes}
          activeSessions={[]}
          {...mockHandlers}
          onDeleteQuiz={vi.fn()}
        />
      </NotificationProvider>
    );

    expect(screen.getByText("Quiz 1")).toBeInTheDocument();
    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("Quiz 2")).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
  });

  it("should call onManageQuiz when manage button is clicked", async () => {
    const mockHandlers = {
      onCreateQuiz: vi.fn(),
      onManageQuiz: vi.fn(),
      onLaunchQuiz: vi.fn(),
      onJoinSession: vi.fn(),
    };

    render(
      <NotificationProvider>
        <AdminDashboard
          quizzes={mockQuizzes}
          activeSessions={[]}
          {...mockHandlers}
          onDeleteQuiz={vi.fn()}
        />
      </NotificationProvider>
    );

    const user = userEvent.setup();
    const manageButtons = screen.getAllByRole("button", { name: /manage/i });
    await user.click(manageButtons[0]);

    expect(mockHandlers.onManageQuiz).toHaveBeenCalledWith(mockQuizzes[0]);
  });

  it("should call onLaunchQuiz when launch button is clicked", async () => {
    const mockHandlers = {
      onCreateQuiz: vi.fn(),
      onManageQuiz: vi.fn(),
      onLaunchQuiz: vi.fn(),
      onJoinSession: vi.fn(),
    };

    render(
      <NotificationProvider>
        <AdminDashboard
          quizzes={mockQuizzes}
          activeSessions={[]}
          {...mockHandlers}
          onDeleteQuiz={vi.fn()}
        />
      </NotificationProvider>
    );

    const user = userEvent.setup();
    const launchButtons = screen.getAllByRole("button", { name: /launch/i });
    await user.click(launchButtons[0]);

    expect(mockHandlers.onLaunchQuiz).toHaveBeenCalledWith(mockQuizzes[0].id);
  });

  it("should disable launch button when quiz has no questions", () => {
    const quizzesWithEmpty = [
      {
        ...mockQuizzes[0],
        id: 999,
        title: "Empty Quiz",
        question_count: 0,
      },
    ];

    const mockHandlers = {
      onCreateQuiz: vi.fn(),
      onManageQuiz: vi.fn(),
      onLaunchQuiz: vi.fn(),
      onJoinSession: vi.fn(),
    };

    render(
      <NotificationProvider>
        <AdminDashboard
          quizzes={quizzesWithEmpty}
          activeSessions={[]}
          {...mockHandlers}
          onDeleteQuiz={vi.fn()}
        />
      </NotificationProvider>
    );

    const launchButton = screen.getByRole("button", { name: /launch/i });
    expect(launchButton).toBeDisabled();
    const title = launchButton.getAttribute("title");
    expect(title).toBeTruthy();
    expect(
      title === "errors.addAtLeastOneQuestion" ||
        /add at least one question/i.test(title ?? "")
    ).toBe(true);
  });

  it("should show join button when a live session exists", () => {
    const mockHandlers = {
      onCreateQuiz: vi.fn(),
      onManageQuiz: vi.fn(),
      onLaunchQuiz: vi.fn(),
      onJoinSession: vi.fn(),
    };

    const activeSessions: GameSession[] = [
      createGameSessionFixture({
        quizId: 1,
        sessionId: 100,
      }),
    ];

    render(
      <NotificationProvider>
        <AdminDashboard
          quizzes={mockQuizzes}
          activeSessions={activeSessions}
          {...mockHandlers}
          onDeleteQuiz={vi.fn()}
        />
      </NotificationProvider>
    );

    const joinButtons = screen.getAllByText(/Join session/i);
    expect(joinButtons).toHaveLength(2);
  });

  it("should disable delete button when a live session exists", () => {
    const mockHandlers = {
      onCreateQuiz: vi.fn(),
      onManageQuiz: vi.fn(),
      onLaunchQuiz: vi.fn(),
      onJoinSession: vi.fn(),
    };

    const activeSessions: GameSession[] = [
      createGameSessionFixture({
        quizId: 1,
        sessionId: 100,
      }),
    ];

    render(
      <NotificationProvider>
        <AdminDashboard
          quizzes={mockQuizzes}
          activeSessions={activeSessions}
          {...mockHandlers}
          onDeleteQuiz={vi.fn()}
        />
      </NotificationProvider>
    );

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    expect(deleteButtons[0]).toBeDisabled();

    const title = deleteButtons[0].getAttribute("title");
    expect(title).toBeTruthy();
    expect(
      title === "quiz.errors.quizHasActiveSession" ||
        /can't delete|cannot delete|session is active/i.test(title ?? "")
    ).toBe(true);
  });
});
