import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminDashboard from "../AdminDashboard";
import { NotificationProvider } from "../../../../../application/app/context/NotificationContext";

const organizationContextMock = vi.hoisted(() => ({
  useOrganization: vi.fn(),
}));

vi.mock("../../../../../shared/context/OrganizationContext", () => ({
  useOrganization: organizationContextMock.useOrganization,
}));

describe("AdminDashboard", () => {
  const mockQuizzes = [
    {
      id: 1,
      title: "Quiz 1",
      description: "Description 1",
      created_by: 1,
      created_at: "2024-01-01",
      question_count: 3,
      is_active: true,
    },
    {
      id: 2,
      title: "Quiz 2",
      description: "Description 2",
      created_by: 1,
      created_at: "2024-01-02",
      question_count: 5,
      is_active: false,
    },
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
  });

  it("should render admin dashboard with title", () => {
    const mockHandlers = {
      onCreateQuiz: vi.fn(),
      onManageQuiz: vi.fn(),
      onLaunchQuiz: vi.fn(),
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
});
