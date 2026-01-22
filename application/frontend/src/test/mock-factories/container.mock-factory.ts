import { vi } from "vitest";
import { createGameServiceMock } from "./game-service.mock-factory";

type MockFunction = ReturnType<typeof vi.fn>;
type MockOverride = MockFunction | ((...args: unknown[]) => unknown);

type AuthRepositoryMock = {
  login: MockFunction;
  register: MockFunction;
  getCurrentUser: MockFunction;
  updateProfile: MockFunction;
  regenerateAvatar: MockFunction;
  logout: MockFunction;
};

type OrganizationRepositoryMock = {
  getMyOrganizations: MockFunction;
  getOrganizationDashboard: MockFunction;
  createOrganization: MockFunction;
};

type QuizRepositoryMock = {
  getQuizzes: MockFunction;
  getQuestions: MockFunction;
  addQuestion: MockFunction;
  deleteQuestion: MockFunction;
  updateQuestion: MockFunction;
  createQuiz: MockFunction;
  deleteQuiz: MockFunction;
  updateQuiz: MockFunction;
};

type GameServiceMock = {
  joinGame: MockFunction;
  getActiveSessions: MockFunction;
  getSessionsByQuiz: MockFunction;
  createSession: MockFunction;
  endGame: MockFunction;
  submitAnswer: MockFunction;
  nextQuestion: MockFunction;
  startGame: MockFunction;
  stopGame: MockFunction;
  resumeGame: MockFunction;
  launchQuiz: MockFunction;
};

type ServiceOverrides<T extends Record<string, MockFunction>> = Partial<
  Record<keyof T, MockOverride>
>;

export type ContainerMock = {
  authRepository: AuthRepositoryMock;
  organizationRepository: OrganizationRepositoryMock;
  quizRepository: QuizRepositoryMock;
  gameService: GameServiceMock;
};

export type ContainerMockOverrides = {
  authRepository?: ServiceOverrides<AuthRepositoryMock>;
  organizationRepository?: ServiceOverrides<OrganizationRepositoryMock>;
  quizRepository?: ServiceOverrides<QuizRepositoryMock>;
  gameService?: ServiceOverrides<GameServiceMock>;
};

const toMock = (override?: MockOverride): MockFunction => {
  if (!override) {
    return vi.fn();
  }

  if ("mock" in override) {
    return override as MockFunction;
  }

  return vi.fn(override as (...args: unknown[]) => unknown);
};

const applyOverrides = <T extends Record<string, MockFunction>>(
  defaults: T,
  overrides?: ServiceOverrides<T>
): T => {
  if (!overrides) {
    return defaults;
  }

  const result = { ...defaults } as T;
  for (const [key, override] of Object.entries(overrides)) {
    result[key as keyof T] = toMock(override) as T[keyof T];
  }

  return result;
};

export const createContainerMock = (
  overrides: ContainerMockOverrides = {}
): ContainerMock => {
  const authRepository = applyOverrides<AuthRepositoryMock>(
    {
      login: vi.fn(),
      register: vi.fn(),
      getCurrentUser: vi.fn(),
      updateProfile: vi.fn(),
      regenerateAvatar: vi.fn(),
      logout: vi.fn(),
    },
    overrides.authRepository
  );

  const organizationRepository = applyOverrides<OrganizationRepositoryMock>(
    {
      getMyOrganizations: vi.fn(),
      getOrganizationDashboard: vi.fn(),
      createOrganization: vi.fn(),
    },
    overrides.organizationRepository
  );

  const quizRepository = applyOverrides<QuizRepositoryMock>(
    {
      getQuizzes: vi.fn(),
      getQuestions: vi.fn(),
      addQuestion: vi.fn(),
      deleteQuestion: vi.fn(),
      updateQuestion: vi.fn(),
      createQuiz: vi.fn(),
      deleteQuiz: vi.fn(),
      updateQuiz: vi.fn(),
    },
    overrides.quizRepository
  );

  const gameService = applyOverrides<GameServiceMock>(
    createGameServiceMock(),
    overrides.gameService
  );

  return {
    authRepository,
    organizationRepository,
    quizRepository,
    gameService,
  };
};
