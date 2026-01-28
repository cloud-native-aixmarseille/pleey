import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PredictionManagementFacade } from '../../application/prediction-management/facades/prediction-management.facade';
import { QuizManagementFacade } from '../../application/quiz-management/facades/quiz-management.facade';
import { GameSessionRoutingService } from '../../domains/game-session/services/game-session-routing-service';
import { GameRoutesFactory } from '../../presentation/game-session/live/shared/routes/game-routes-factory';
import { AuthRoutesFactory } from '../../presentation/identity/routes/auth-routes-factory';
import { PredictionRoutesFactory } from '../../presentation/prediction/routes/prediction-routes-factory';
import { QuizRoutesFactory } from '../../presentation/quiz/routes/quiz-routes-factory';
import { DashboardRoutesFactory } from '../../presentation/workspace/dashboard/routes/dashboard-routes-factory';
import { DashboardReadGatewayMockFactory } from '../../test-utils/factories/dashboard-read-gateway-mock-factory';
import { GameTypeCatalogGatewayMockFactory } from '../../test-utils/factories/game-type-catalog-gateway-mock-factory';
import { resetGameTypeSequence } from '../../test-utils/factories/game-type-descriptor-fixture-factory';
import { AppGameSessionRoutesFactory } from '../game-session/live/session-shell/app-game-session-routes-factory';
import { RouteRegistry } from './route-registry';

const gameSessionRoutingService = new GameSessionRoutingService();

vi.mock('react-i18next', async () => {
  const { ReactI18nextMockFactory } = await import(
    'src/test-utils/factories/react-i18next-mock-factory'
  );

  return new ReactI18nextMockFactory().createModule();
});

describe('RouteRegistry', () => {
  const dashboardReadGatewayMockFactory = new DashboardReadGatewayMockFactory();
  const gameTypeCatalogGatewayMockFactory = new GameTypeCatalogGatewayMockFactory();

  function createRegistry(): RouteRegistry {
    return new RouteRegistry(
      [
        new AuthRoutesFactory(),
        new DashboardRoutesFactory(
          gameTypeCatalogGatewayMockFactory.create(),
          {
            loadActiveSessions: vi.fn(),
            loadOrganizations: vi.fn(),
            loadOrganizationDashboard: vi.fn(),
            loadProjectGames: vi.fn(),
            loadProjectsByOrganization: vi.fn(),
            resumeGameSession: vi.fn(),
            stopGameSession: vi.fn(),
          } as never,
          { resolveManageGameRoute: vi.fn(), resolveOpenSessionRoute: vi.fn() } as never,
          { loadOrganizationSelection: vi.fn(), loadOrganizationWorkspace: vi.fn() } as never,
        ),
        new QuizRoutesFactory(
          {
            createQuestion: vi.fn(),
            deleteQuestion: vi.fn(),
            loadManagementData: vi.fn(),
            updateQuestion: vi.fn(),
            updateQuiz: vi.fn(),
          } as unknown as QuizManagementFacade,
          dashboardReadGatewayMockFactory.create(),
        ),
        new PredictionRoutesFactory(
          {
            createPrompt: vi.fn(),
            deletePrompt: vi.fn(),
            loadManagementData: vi.fn(),
            updatePrompt: vi.fn(),
          } as unknown as PredictionManagementFacade,
          dashboardReadGatewayMockFactory.create(),
        ),
        new AppGameSessionRoutesFactory(
          new GameRoutesFactory({} as never, {} as never, {} as never, {} as never, {} as never),
          gameSessionRoutingService,
        ),
      ],
      gameSessionRoutingService,
    );
  }

  beforeEach(() => {
    resetGameTypeSequence();
  });

  describe('getRoutes()', () => {
    it('returns a single root route at path "/"', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const routes = registry.getRoutes();

      // Assert
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/');
    });

    it('includes an identity/sign-in child route', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const children = registry.getRoutes()[0].children ?? [];

      // Assert
      expect(children.some((r) => r.path === 'identity/sign-in')).toBe(true);
    });

    it('includes an identity/register child route', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const children = registry.getRoutes()[0].children ?? [];

      // Assert
      expect(children.some((r) => r.path === 'identity/register')).toBe(true);
    });

    it('includes a dashboard index route', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const children = registry.getRoutes()[0].children ?? [];

      // Assert
      expect(children.some((r) => r.path === 'workspace/dashboard')).toBe(true);
    });

    it('includes the dedicated quiz management route', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const children = registry.getRoutes()[0].children ?? [];

      // Assert
      expect(children.some((r) => r.path === 'quizzes/:quizId')).toBe(true);
    });

    it('includes the dedicated prediction management route', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const children = registry.getRoutes()[0].children ?? [];

      // Assert
      expect(children.some((r) => r.path === 'predictions/:predictionId')).toBe(true);
    });

    it('includes the game/join route', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const children = registry.getRoutes()[0].children ?? [];
      const gameRoute = children.find((r) => r.path === 'game');

      // Assert
      expect(gameRoute).toBeDefined();
      expect(gameRoute?.children?.some((r) => r.path === 'join')).toBe(true);
    });

    it('includes the stage route nested under game/:sessionPin', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const children = registry.getRoutes()[0].children ?? [];
      const gameRoute = children.find((r) => r.path === 'game');
      const sessionRoute = gameRoute?.children?.find((r) => r.path === ':sessionPin');
      const guardRoute = sessionRoute?.children?.[0];

      // Assert
      expect(sessionRoute).toBeDefined();
      expect(guardRoute?.children?.some((r) => r.path === 'stage/:stageId')).toBe(true);
    });

    it('includes the stage result route nested under game/:sessionPin', () => {
      const registry = createRegistry();

      const children = registry.getRoutes()[0].children ?? [];
      const gameRoute = children.find((r) => r.path === 'game');
      const sessionRoute = gameRoute?.children?.find((r) => r.path === ':sessionPin');
      const guardRoute = sessionRoute?.children?.[0];

      expect(sessionRoute).toBeDefined();
      expect(guardRoute?.children?.some((r) => r.path === 'stage/:stageId/result')).toBe(true);
    });

    it('includes the lobby route nested under game/:sessionPin', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const children = registry.getRoutes()[0].children ?? [];
      const gameRoute = children.find((r) => r.path === 'game');
      const sessionRoute = gameRoute?.children?.find((r) => r.path === ':sessionPin');
      const guardRoute = sessionRoute?.children?.[0];

      // Assert
      expect(sessionRoute).toBeDefined();
      expect(guardRoute?.children?.some((r) => r.path === 'lobby')).toBe(true);
    });

    it('includes the leaderboard route nested under game/:sessionPin', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const children = registry.getRoutes()[0].children ?? [];
      const gameRoute = children.find((r) => r.path === 'game');
      const sessionRoute = gameRoute?.children?.find((r) => r.path === ':sessionPin');
      const guardRoute = sessionRoute?.children?.[0];

      // Assert
      expect(sessionRoute).toBeDefined();
      expect(guardRoute?.children?.some((r) => r.path === 'leaderboard')).toBe(true);
    });

    it('includes a wildcard catch-all route', () => {
      // Arrange
      const registry = createRegistry();

      // Act
      const children = registry.getRoutes()[0].children ?? [];

      // Assert
      expect(children.some((r) => r.path === '*')).toBe(true);
    });
  });
});
