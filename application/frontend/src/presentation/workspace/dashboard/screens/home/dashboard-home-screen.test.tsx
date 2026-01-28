import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardHomeActionsFacade } from '../../../../../application/workspace/dashboard/facades/dashboard-home-actions.facade';
import type { DashboardWorkspaceGateway } from '../../../../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import type { GameTypeDescriptor } from '../../../../../domains/game-catalog/entities/game-type-catalog';
import { GameSessionStatus } from '../../../../../domains/game-session/entities/game-session-status';
import { resetDashboardActiveSessionSequence } from '../../../../../test-utils/factories/dashboard-active-session-fixture-factory';
import { DashboardHomeScreenFixtureFactory } from '../../../../../test-utils/factories/dashboard-home-screen-fixture-factory';
import {
  createGameTypeDescriptorFixture,
  resetGameTypeSequence,
} from '../../../../../test-utils/factories/game-type-descriptor-fixture-factory';
import { WorkspaceSelectionPortMockFactory } from '../../../../../test-utils/factories/workspace-selection-port-mock-factory';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { DashboardHomeScreen } from './dashboard-home-screen';

const dashboardHomeScreenFixtureFactory = new DashboardHomeScreenFixtureFactory();
const workspaceSelectionPortMockFactory = new WorkspaceSelectionPortMockFactory();
const resolveSessionEntryRoute = (session: { pin: string; status: GameSessionStatus }) => {
  const pin = session.pin.trim().toUpperCase();
  if (session.status === GameSessionStatus.ENDED) return `/game/${pin}/leaderboard`;
  if (session.status === GameSessionStatus.ACTIVE) return `/game/${pin}/stage/1`;
  return `/game/${pin}/lobby`;
};
const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
}));

function createDashboardHomeActions(
  overrides: Partial<DashboardHomeActionsFacade> = {},
): DashboardHomeActionsFacade {
  return {
    resolveOpenSessionRoute: vi.fn((session) => resolveSessionEntryRoute(session)),
    launchSessionRoute: vi.fn(async (gameId: number) => `/game/GAME-${gameId}/lobby`),
    resolveManageGameRoute: vi.fn((game) => `/games/${game.relatedGameId}`),
    resolveOrganizationsRoute: vi.fn(() => '/workspace/organizations'),
    resolveProjectsRoute: vi.fn(() => '/workspace/organizations#projects'),
    ...overrides,
  } as DashboardHomeActionsFacade;
}

function createDashboardWorkspace(
  options: {
    organizations?: Array<{ id: number; name: string; description: string | null }>;
    organizationId?: number | null;
    organizationDashboard?: {
      organization: { id: number; name: string; description: string | null };
      stats: {
        totalGames: number;
        totalGameSessions: number;
        activeGameSessions: number;
        totalMembers: number;
        totalProjects: number;
      };
    } | null;
    projects?: Array<{
      id: number;
      name: string;
      description: string | null;
      organizationId: number;
      createdAt: string;
    }>;
    projectId?: number | null;
  } = {},
): DashboardWorkspaceGateway {
  const organizations = options.organizations ?? [
    dashboardHomeScreenFixtureFactory.createOrganization(),
  ];
  const organizationId = options.organizationId ?? organizations[0]?.id ?? null;

  return {
    loadOrganizationSelection: vi.fn().mockResolvedValue({
      organizations,
      organizationId,
    }),
    loadOrganizationWorkspace: vi.fn().mockResolvedValue({
      organizationDashboard: options.organizationDashboard ?? null,
      projects: options.projects ?? [dashboardHomeScreenFixtureFactory.createProject()],
      projectId: options.projectId ?? options.projects?.[0]?.id ?? 8,
    }),
    setOrganizationSelection: vi.fn(),
    setProjectSelection: vi.fn(),
  };
}

function renderDashboardHomeScreen(gameTypes: readonly GameTypeDescriptor[] = []) {
  const dashboardReadGateway = dashboardHomeScreenFixtureFactory.createDashboardReadGateway({
    loadOrganizationDashboard: vi.fn().mockResolvedValue(
      dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
        organization: { id: 1, name: 'Org 1', description: null },
      }),
    ),
  });

  return renderWithProviders(
    <DashboardHomeScreen
      dashboardHomeActions={createDashboardHomeActions()}
      gameTypes={gameTypes}
      dashboardWorkspace={createDashboardWorkspace()}
      loadActiveSessions={dashboardReadGateway.loadActiveSessions}
      leaveCurrentPlayerSession={dashboardReadGateway.leaveCurrentPlayerSession}
      loadProjectDashboardGames={dashboardReadGateway.loadProjectDashboardGames}
      resumeGameSession={dashboardReadGateway.resumeGameSession}
      stopGameSession={dashboardReadGateway.stopGameSession}
    />,
  );
}

vi.mock('../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('../../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/factories/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal, {
    navigate: navigateMock,
  });
});

describe('DashboardHomeScreen', () => {
  beforeEach(() => {
    resetDashboardActiveSessionSequence();
    resetGameTypeSequence();
    navigateMock.mockReset();
  });

  describe('render()', () => {
    it('renders the workspace toolbar with organization and project selects', () => {
      renderDashboardHomeScreen();

      expect(
        screen.getByRole('toolbar', { name: 'dashboard.workspace.sectionTitle' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'dashboard.workspace.manageOrganizations' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'dashboard.workspace.manageProjects' }),
      ).toBeInTheDocument();
    });

    it('navigates to organization management from the workspace bar', async () => {
      const user = userEvent.setup();

      renderDashboardHomeScreen();

      await user.click(
        screen.getByRole('button', { name: 'dashboard.workspace.manageOrganizations' }),
      );

      expect(navigateMock).toHaveBeenCalledWith('/workspace/organizations');
    });

    it('navigates to project management from the workspace bar', async () => {
      const user = userEvent.setup();

      renderDashboardHomeScreen();

      await user.click(screen.getByRole('button', { name: 'dashboard.workspace.manageProjects' }));

      expect(navigateMock).toHaveBeenCalledWith('/workspace/organizations#projects');
    });

    it('does not render metrics when no organization is selected', () => {
      renderDashboardHomeScreen();

      expect(
        screen.queryByRole('region', { name: 'dashboard.stats.title' }),
      ).not.toBeInTheDocument();
    });

    it('does not render the active sessions section when there are no sessions', () => {
      renderDashboardHomeScreen();

      expect(
        screen.queryByRole('heading', { name: 'dashboard.sessions.title' }),
      ).not.toBeInTheDocument();
    });

    it('renders the games section', () => {
      renderDashboardHomeScreen();

      expect(screen.getByRole('heading', { name: 'dashboard.games.title' })).toBeInTheDocument();
    });

    it('restores the persisted workspace selection and shows metrics', async () => {
      const dashboardReadGateway = dashboardHomeScreenFixtureFactory.createDashboardReadGateway({
        loadOrganizationDashboard: vi.fn().mockResolvedValue(
          dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
            stats: {
              totalGames: 3,
              totalGameSessions: 4,
              activeGameSessions: 1,
              totalMembers: 5,
              totalProjects: 1,
            },
          }),
        ),
      });
      workspaceSelectionPortMockFactory.create(undefined, {
        organizationId: 2,
        projectId: 8,
      });

      renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={createDashboardHomeActions()}
          gameTypes={[]}
          dashboardWorkspace={createDashboardWorkspace({
            organizationDashboard: dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
              stats: {
                totalGames: 3,
                totalGameSessions: 4,
                activeGameSessions: 1,
                totalMembers: 5,
                totalProjects: 1,
              },
            }),
            projectId: 8,
          })}
          loadActiveSessions={dashboardReadGateway.loadActiveSessions}
          leaveCurrentPlayerSession={dashboardReadGateway.leaveCurrentPlayerSession}
          loadProjectDashboardGames={dashboardReadGateway.loadProjectDashboardGames}
          resumeGameSession={dashboardReadGateway.resumeGameSession}
          stopGameSession={dashboardReadGateway.stopGameSession}
        />,
      );

      expect(
        await screen.findByRole('region', { name: 'dashboard.stats.title' }),
      ).toBeInTheDocument();
    });

    it('renders metrics when organization dashboard is loaded', async () => {
      const dashboardReadGateway = dashboardHomeScreenFixtureFactory.createDashboardReadGateway({
        loadOrganizationDashboard: vi.fn().mockResolvedValue(
          dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
            stats: {
              totalGames: 3,
              totalGameSessions: 4,
              activeGameSessions: 1,
              totalMembers: 5,
              totalProjects: 1,
            },
          }),
        ),
      });

      renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={createDashboardHomeActions()}
          gameTypes={[]}
          dashboardWorkspace={createDashboardWorkspace({
            organizationDashboard: dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
              stats: {
                totalGames: 3,
                totalGameSessions: 4,
                activeGameSessions: 1,
                totalMembers: 5,
                totalProjects: 1,
              },
            }),
          })}
          loadActiveSessions={dashboardReadGateway.loadActiveSessions}
          leaveCurrentPlayerSession={dashboardReadGateway.leaveCurrentPlayerSession}
          loadProjectDashboardGames={dashboardReadGateway.loadProjectDashboardGames}
          resumeGameSession={dashboardReadGateway.resumeGameSession}
          stopGameSession={dashboardReadGateway.stopGameSession}
        />,
      );

      expect(await screen.findByText('3')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders project-scoped game summaries after the project loads', async () => {
      const dashboardReadGateway = dashboardHomeScreenFixtureFactory.createDashboardReadGateway({
        loadOrganizationDashboard: vi.fn().mockResolvedValue(
          dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
            stats: {
              totalGames: 3,
              totalGameSessions: 4,
              activeGameSessions: 1,
              totalMembers: 5,
              totalProjects: 1,
            },
          }),
        ),
        loadProjectDashboardGames: vi.fn().mockResolvedValue(
          dashboardHomeScreenFixtureFactory.createDashboardGamesPage({
            items: [
              {
                gameId: 18,
                type: 'quiz',
                title: 'Project quiz',
                description: null,
                createdAt: '2026-03-12T00:00:00.000Z',
                relatedGameId: 8,
                stageCount: 6,
                summary: {
                  translationKey: 'quiz.management.questionSummary',
                  values: {
                    count: '6',
                  },
                },
              },
            ],
            totalCount: 1,
            overallCount: 1,
          }),
        ),
      });

      renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={createDashboardHomeActions()}
          gameTypes={[createGameTypeDescriptorFixture({ key: 'quiz' })]}
          dashboardWorkspace={createDashboardWorkspace({
            organizationDashboard: dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
              stats: {
                totalGames: 3,
                totalGameSessions: 4,
                activeGameSessions: 1,
                totalMembers: 5,
                totalProjects: 1,
              },
            }),
          })}
          loadActiveSessions={dashboardReadGateway.loadActiveSessions}
          leaveCurrentPlayerSession={dashboardReadGateway.leaveCurrentPlayerSession}
          loadProjectDashboardGames={dashboardReadGateway.loadProjectDashboardGames}
          resumeGameSession={dashboardReadGateway.resumeGameSession}
          stopGameSession={dashboardReadGateway.stopGameSession}
        />,
      );

      expect(await screen.findByText('Project quiz')).toBeInTheDocument();
      expect(screen.getByText('quiz.management.questionSummary (count=6)')).toBeInTheDocument();
    });

    it('navigates quiz management with the quiz id instead of the game id', async () => {
      const user = userEvent.setup();
      const dashboardHomeActions = createDashboardHomeActions({
        resolveManageGameRoute: vi.fn((game) => `/quizzes/${game.relatedGameId}`),
      });
      const dashboardReadGateway = dashboardHomeScreenFixtureFactory.createDashboardReadGateway({
        loadOrganizationDashboard: vi.fn().mockResolvedValue(
          dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
            stats: {
              totalGames: 1,
              totalGameSessions: 0,
              activeGameSessions: 0,
              totalMembers: 5,
              totalProjects: 1,
            },
          }),
        ),
        loadProjectDashboardGames: vi.fn().mockResolvedValue(
          dashboardHomeScreenFixtureFactory.createDashboardGamesPage({
            items: [
              {
                gameId: 13,
                type: 'quiz',
                title: 'Project quiz',
                description: null,
                createdAt: '2026-03-12T00:00:00.000Z',
                relatedGameId: 12,
                stageCount: 6,
              },
            ],
            totalCount: 1,
            overallCount: 1,
          }),
        ),
      });

      renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={dashboardHomeActions}
          gameTypes={[
            createGameTypeDescriptorFixture({
              key: 'quiz',
              managementRoutePath: '/quizzes',
            }),
          ]}
          dashboardWorkspace={createDashboardWorkspace({
            organizationDashboard: dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
              stats: {
                totalGames: 1,
                totalGameSessions: 0,
                activeGameSessions: 0,
                totalMembers: 5,
                totalProjects: 1,
              },
            }),
          })}
          loadActiveSessions={dashboardReadGateway.loadActiveSessions}
          leaveCurrentPlayerSession={dashboardReadGateway.leaveCurrentPlayerSession}
          loadProjectDashboardGames={dashboardReadGateway.loadProjectDashboardGames}
          resumeGameSession={dashboardReadGateway.resumeGameSession}
          stopGameSession={dashboardReadGateway.stopGameSession}
        />,
      );

      await screen.findByText('Project quiz');

      await user.click(screen.getByRole('button', { name: 'dashboard.games.actions.manage' }));

      expect(navigateMock).toHaveBeenCalledWith('/quizzes/12');
    });

    it('renders active sessions and navigates to the best entry route', async () => {
      const user = userEvent.setup();
      const dashboardReadGateway = dashboardHomeScreenFixtureFactory.createDashboardReadGateway({
        loadActiveSessions: vi
          .fn()
          .mockResolvedValue([dashboardHomeScreenFixtureFactory.createActiveSession()]),
      });

      renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={createDashboardHomeActions()}
          gameTypes={[]}
          dashboardWorkspace={createDashboardWorkspace()}
          loadActiveSessions={dashboardReadGateway.loadActiveSessions}
          leaveCurrentPlayerSession={dashboardReadGateway.leaveCurrentPlayerSession}
          loadProjectDashboardGames={dashboardReadGateway.loadProjectDashboardGames}
          resumeGameSession={dashboardReadGateway.resumeGameSession}
          stopGameSession={dashboardReadGateway.stopGameSession}
        />,
      );

      expect(
        await screen.findByText('dashboard.sessions.fallbackTitle (pin=AB12CD)'),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'dashboard.sessions.actions.openLive' }));

      expect(navigateMock).toHaveBeenCalledWith('/game/AB12CD/stage/1');
    });

    it('shows a pause action for active sessions and delegates the update', async () => {
      const user = userEvent.setup();
      const activeSession = dashboardHomeScreenFixtureFactory.createActiveSession();
      const stopGameSession = vi.fn().mockResolvedValue(
        dashboardHomeScreenFixtureFactory.createActiveSession({
          status: GameSessionStatus.PAUSED,
        }),
      );
      const dashboardReadGateway = dashboardHomeScreenFixtureFactory.createDashboardReadGateway({
        loadActiveSessions: vi.fn().mockResolvedValue([activeSession]),
        stopGameSession,
      });

      renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={createDashboardHomeActions()}
          gameTypes={[]}
          dashboardWorkspace={createDashboardWorkspace()}
          loadActiveSessions={dashboardReadGateway.loadActiveSessions}
          leaveCurrentPlayerSession={dashboardReadGateway.leaveCurrentPlayerSession}
          loadProjectDashboardGames={dashboardReadGateway.loadProjectDashboardGames}
          resumeGameSession={dashboardReadGateway.resumeGameSession}
          stopGameSession={dashboardReadGateway.stopGameSession}
        />,
      );

      await screen.findByText('dashboard.sessions.fallbackTitle (pin=AB12CD)');
      await user.click(screen.getByRole('button', { name: 'dashboard.sessions.actions.pause' }));

      expect(stopGameSession).toHaveBeenCalledWith(activeSession.sessionId);
      expect(await screen.findByText('dashboard.sessions.status.paused')).toBeInTheDocument();
    });
  });

  describe('game list filters', () => {
    function renderWithGames(
      games: Array<{
        gameId: number;
        type: string;
        title: string;
        description: string | null;
        createdAt: string;
        relatedGameId: number | null;
        stageCount: number;
        summary?: {
          translationKey: string;
          values?: Record<string, string>;
        };
      }>,
      gameTypes: readonly GameTypeDescriptor[] = [],
    ) {
      const loadProjectDashboardGames = vi.fn().mockImplementation((query) => {
        let filtered = games;

        const search = String(query.search ?? '')
          .trim()
          .toLowerCase();
        if (search.length > 0) {
          filtered = filtered.filter(
            (game) =>
              game.title.toLowerCase().includes(search) ||
              (game.description?.toLowerCase().includes(search) ?? false),
          );
        }

        if (Array.isArray(query.typeFilter) && query.typeFilter.length > 0) {
          filtered = filtered.filter((game) => query.typeFilter.includes(game.type));
        }

        filtered = [...filtered].sort((left, right) => {
          if (query.sortField === 'title') {
            const byTitle = left.title.localeCompare(right.title);

            return query.sortDirection === 'asc' ? byTitle : -byTitle;
          }

          const byDate = left.createdAt.localeCompare(right.createdAt);

          return query.sortDirection === 'asc' ? byDate : -byDate;
        });

        const start = (query.page - 1) * query.pageSize;
        const items = filtered.slice(start, start + query.pageSize);

        return Promise.resolve({
          items,
          totalCount: filtered.length,
          overallCount: games.length,
          page: query.page,
          pageSize: query.pageSize,
          totalPages: Math.max(1, Math.ceil(filtered.length / query.pageSize)),
        });
      });
      const dashboardReadGateway = dashboardHomeScreenFixtureFactory.createDashboardReadGateway({
        loadOrganizationDashboard: vi.fn().mockResolvedValue(
          dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
            stats: {
              totalGames: games.length,
              totalGameSessions: 0,
              activeGameSessions: 0,
              totalMembers: 1,
              totalProjects: 1,
            },
          }),
        ),
        loadProjectDashboardGames,
      });

      const renderResult = renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={createDashboardHomeActions()}
          gameTypes={gameTypes}
          dashboardWorkspace={createDashboardWorkspace({
            organizationDashboard: dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
              stats: {
                totalGames: games.length,
                totalGameSessions: 0,
                activeGameSessions: 0,
                totalMembers: 1,
                totalProjects: 1,
              },
            }),
          })}
          loadActiveSessions={dashboardReadGateway.loadActiveSessions}
          leaveCurrentPlayerSession={dashboardReadGateway.leaveCurrentPlayerSession}
          loadProjectDashboardGames={dashboardReadGateway.loadProjectDashboardGames}
          resumeGameSession={dashboardReadGateway.resumeGameSession}
          stopGameSession={dashboardReadGateway.stopGameSession}
        />,
      );

      return { ...renderResult, loadProjectDashboardGames };
    }

    const twoGames = [
      {
        gameId: 10,
        type: 'quiz',
        title: 'Alpha quiz',
        description: null,
        createdAt: '2026-03-10T00:00:00.000Z',
        relatedGameId: 1,
        stageCount: 0,
      },
      {
        gameId: 11,
        type: 'prediction',
        title: 'Beta prediction',
        description: null,
        createdAt: '2026-03-12T00:00:00.000Z',
        relatedGameId: 2,
        stageCount: 0,
      },
    ];

    it('renders the search filter when games are loaded', async () => {
      renderWithGames(twoGames);

      expect(
        await screen.findByRole('search', { name: 'dashboard.games.filters.label' }),
      ).toBeInTheDocument();
    });

    it('filters games by search term', async () => {
      const user = userEvent.setup();
      renderWithGames(twoGames);

      await screen.findByText('Alpha quiz');

      await user.type(
        screen.getByPlaceholderText('dashboard.games.filters.searchPlaceholder'),
        'Beta',
      );

      expect(screen.queryByText('Alpha quiz')).not.toBeInTheDocument();
      expect(screen.getByText('Beta prediction')).toBeInTheDocument();
    });

    it('filters games by type', async () => {
      const user = userEvent.setup();
      const gameTypes = [
        createGameTypeDescriptorFixture({ key: 'quiz' }),
        createGameTypeDescriptorFixture({ key: 'prediction' }),
      ];
      renderWithGames(twoGames, gameTypes);

      await screen.findByText('Alpha quiz');

      const typeInput = screen.getByRole('textbox', {
        name: 'dashboard.games.filters.typeLabel',
      });
      await user.click(typeInput);

      const predictionOption = await screen.findByRole('option', {
        name: 'games.type2.title',
        hidden: true,
      });
      await user.click(predictionOption);

      expect(screen.queryByText('Alpha quiz')).not.toBeInTheDocument();
      expect(screen.getByText('Beta prediction')).toBeInTheDocument();
    });

    it('shows no-results state when filters exclude all games', async () => {
      const user = userEvent.setup();
      const { loadProjectDashboardGames } = renderWithGames(twoGames);

      await screen.findByText('Alpha quiz');

      await user.type(
        screen.getByPlaceholderText('dashboard.games.filters.searchPlaceholder'),
        'zzz-no-match',
      );

      expect(loadProjectDashboardGames).toHaveBeenLastCalledWith({
        projectId: 8,
        search: 'zzz-no-match',
        typeFilter: [],
        sortField: 'createdAt',
        sortDirection: 'desc',
        page: 1,
        pageSize: 9,
      });
    });
  });
});
