import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminDashboard from "../AdminDashboard";

const mockSetCurrentOrganization = vi.fn();
const mockLoadOrganizations = vi.fn();
const mockLoadDashboard = vi.fn();
const mockCreateOrganization = vi.fn();
const mockClearError = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "admin.dashboard": "Admin Dashboard",
        "admin.manageQuizzesSubtitle":
          "Manage your quizzes and launch game sessions",
        "admin.createQuiz": "Create Quiz",
        "admin.noQuizzesTitle": "No quizzes yet",
        "admin.noQuizzesDescription": "Create your first quiz to get started!",
        "admin.createFirstQuiz": "Create my first quiz",
        "admin.manage": "Manage",
        "admin.launch": "Launch",
        "admin.active": "Active",
        "admin.noDescription": "No description",
        "quiz.question": "question",
        "quiz.questionsPlural": "questions",
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock("../../../../shared/context/OrganizationContext", () => ({
  useOrganization: () => ({
    organizations: [],
    currentOrganization: { id: 1, name: "Org 1" },
    dashboard: null,
    isLoading: false,
    error: null,
    setCurrentOrganization: mockSetCurrentOrganization,
    loadOrganizations: mockLoadOrganizations,
    loadDashboard: mockLoadDashboard,
    createOrganization: mockCreateOrganization,
    clearError: mockClearError,
  }),
}));

vi.mock(
  "../../../../shared/components/organization/OrganizationSelector",
  () => ({
    OrganizationSelector: () => <div data-testid="organization-selector" />,
  })
);

describe("AdminDashboard", () => {
  const mockQuizzes = [
    {
      id: 1,
      title: "Quiz 1",
      description: "Description 1",
      created_by: 1,
      created_at: "2024-01-01",
      is_active: true,
      question_count: 5,
    },
    {
      id: 2,
      title: "Quiz 2",
      description: "Description 2",
      created_by: 1,
      created_at: "2024-01-02",
      is_active: false,
      question_count: 3,
    },
  ];

  beforeEach(() => {
    mockSetCurrentOrganization.mockClear();
    mockLoadOrganizations.mockClear();
    mockLoadDashboard.mockClear();
    mockCreateOrganization.mockClear();
    mockClearError.mockClear();
  });

  it("should render admin dashboard with title", () => {
    const mockHandlers = {
      onCreateQuiz: vi.fn(),
      onManageQuiz: vi.fn(),
      onLaunchQuiz: vi.fn(),
    };

    render(<AdminDashboard quizzes={[]} {...mockHandlers} />);

    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Quiz/i)).toBeInTheDocument();
  });

  it("should display list of quizzes", () => {
    const mockHandlers = {
      onCreateQuiz: vi.fn(),
      onManageQuiz: vi.fn(),
      onLaunchQuiz: vi.fn(),
    };

    render(<AdminDashboard quizzes={mockQuizzes} {...mockHandlers} />);

    expect(screen.getByText("Quiz 1")).toBeInTheDocument();
    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("Quiz 2")).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
  });

  it("should call onManageQuiz when manage button is clicked", () => {
    const mockHandlers = {
      onCreateQuiz: vi.fn(),
      onManageQuiz: vi.fn(),
      onLaunchQuiz: vi.fn(),
    };

    render(<AdminDashboard quizzes={mockQuizzes} {...mockHandlers} />);

    const manageButtons = screen.getAllByRole("button", { name: /Manage/i });
    fireEvent.click(manageButtons[0]);

    expect(mockHandlers.onManageQuiz).toHaveBeenCalledWith(mockQuizzes[0]);
  });

  it("should call onLaunchQuiz when launch button is clicked", () => {
    const mockHandlers = {
      onCreateQuiz: vi.fn(),
      onManageQuiz: vi.fn(),
      onLaunchQuiz: vi.fn(),
    };

    render(<AdminDashboard quizzes={mockQuizzes} {...mockHandlers} />);

    const launchButtons = screen.getAllByRole("button", { name: /Launch/i });
    fireEvent.click(launchButtons[0]);

    expect(mockHandlers.onLaunchQuiz).toHaveBeenCalledWith(mockQuizzes[0].id);
  });
});
