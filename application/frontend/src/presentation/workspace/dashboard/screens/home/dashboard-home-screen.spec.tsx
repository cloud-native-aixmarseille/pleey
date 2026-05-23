import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreatePartyDisabledReason } from '../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { PartyId, PartyPin } from '../../../../../domains/game/party/shared/entities/party';
import { PartyRole } from '../../../../../domains/game/party/shared/entities/party-role';
import { PartyStatus } from '../../../../../domains/game/party/shared/entities/party-status';
import type { GameTypeId } from '../../../../../domains/game/types/shared/game-type';
import type { GameTypeDescriptor } from '../../../../../domains/game/types/shared/game-type-catalog';
import { DashboardHomeScreenFixtureFactory } from '../../../../../test-utils/fixtures/dashboard-home-screen-fixture-factory';
import { GameFixtureFactory } from '../../../../../test-utils/fixtures/game-fixture-factory';
import {
  createGameTypeDescriptorFixture,
  resetGameTypeSequence,
} from '../../../../../test-utils/fixtures/game-type-descriptor-fixture-factory';
import { PartyFixtureFactory } from '../../../../../test-utils/fixtures/party-fixture-factory';
import { DashboardHomeActionsFacadeMockFactory } from '../../../../../test-utils/mocks/dashboard-home-actions-facade-mock-factory';
import { DashboardWorkspaceGatewayMockFactory } from '../../../../../test-utils/mocks/dashboard-workspace-gateway-mock-factory';
import { GameIdentifierMockFactory } from '../../../../../test-utils/mocks/game-identifier-mock-factory';
import { GameTypeIdentifierMockFactory } from '../../../../../test-utils/mocks/game-type-identifier-mock-factory';
import { OrganizationIdentifierMockFactory } from '../../../../../test-utils/mocks/organization-identifier-mock-factory';
import { ProjectIdentifierMockFactory } from '../../../../../test-utils/mocks/project-identifier-mock-factory';
import { WorkspaceSelectionPortMockFactory } from '../../../../../test-utils/mocks/workspace-selection-port-mock-factory';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { DashboardHomeScreen } from './dashboard-home-screen';

const gameIdentifier = new GameIdentifierMockFactory().create();
const gameTypeIdentifier = new GameTypeIdentifierMockFactory().create();
const organizationIdentifier = new OrganizationIdentifierMockFactory().create();
const projectIdentifier = new ProjectIdentifierMockFactory().create();

const dashboardHomeScreenFixtureFactory = new DashboardHomeScreenFixtureFactory();
const gameFixtureFactory = new GameFixtureFactory();
const partyFixtureFactory = new PartyFixtureFactory();
const dashboardHomeActionsFacadeMockFactory = new DashboardHomeActionsFacadeMockFactory();
const dashboardWorkspaceGatewayMockFactory = new DashboardWorkspaceGatewayMockFactory();
const workspaceSelectionPortMockFactory = new WorkspaceSelectionPortMockFactory();
const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
}));
const resolvePartyRoute = (party: { partyId: PartyId; role: PartyRole; pin: PartyPin }) =>
  party.role === PartyRole.HOST ? `/party/${party.partyId}/lobby` : `/join/${party.pin}`;

function createDefaultDashboardHomeActions() {
  return dashboardHomeActionsFacadeMockFactory.create({
    resolveManageGameRoute: vi.fn((game) => `/games/${game.gameTypeId}`),
  });
}

function createDefaultDashboardWorkspace(
  overrides: Parameters<DashboardWorkspaceGatewayMockFactory['create']>[0] = {},
) {
  const organization = dashboardHomeScreenFixtureFactory.createOrganization();

  return dashboardWorkspaceGatewayMockFactory.create({
    loadProjectGameCatalog: vi
      .fn()
      .mockResolvedValue(dashboardHomeScreenFixtureFactory.createDashboardGamesPage()),
    createParty: vi.fn().mockResolvedValue(
      partyFixtureFactory.createParty({
        partyId: 44,
        gameId: 18,
        pin: '123456',
        status: PartyStatus.WAITING,
      }),
    ),
    loadUserParties: vi.fn().mockResolvedValue([]),
    restoreOrganizationSelection: vi.fn().mockResolvedValue({
      organizations: [organization],
      organizationId: organization.id,
    }),
    loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
      organizationDashboard: null,
      projects: [dashboardHomeScreenFixtureFactory.createProject()],
      projectId: projectIdentifier.parse(8),
    }),
    ...overrides,
  });
}

async function renderDashboardHomeScreen(gameTypes: readonly GameTypeDescriptor[] = []) {
  const dashboardWorkspace = createDefaultDashboardWorkspace();

  const renderResult = renderWithProviders(
    <DashboardHomeScreen
      dashboardHomeActions={createDefaultDashboardHomeActions()}
      gameTypes={gameTypes}
      dashboardWorkspace={dashboardWorkspace}
      resolvePartyRoute={resolvePartyRoute}
    />,
  );

  await waitFor(() => {
    expect(dashboardWorkspace.restoreOrganizationSelection).toHaveBeenCalledTimes(1);
    expect(dashboardWorkspace.loadOrganizationWorkspaceState).toHaveBeenCalledTimes(1);
    expect(dashboardWorkspace.loadUserParties).toHaveBeenCalledTimes(1);
    expect(dashboardWorkspace.loadProjectGameCatalog).toHaveBeenCalledTimes(1);
  });

  return renderResult;
}

vi.mock('../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('../../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/mocks/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal, {
    navigate: navigateMock,
  });
});

describe('DashboardHomeScreen', () => {
  beforeEach(() => {
    resetGameTypeSequence();
    navigateMock.mockReset();
  });

  describe('render()', () => {
    it('renders the workspace toolbar with organization and project selects', async () => {
      await renderDashboardHomeScreen();

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

      await renderDashboardHomeScreen();

      await user.click(
        screen.getByRole('button', { name: 'dashboard.workspace.manageOrganizations' }),
      );

      expect(navigateMock).toHaveBeenCalledWith('/workspace/organizations');
    });

    it('navigates to project management from the workspace bar', async () => {
      const user = userEvent.setup();

      await renderDashboardHomeScreen();

      await user.click(screen.getByRole('button', { name: 'dashboard.workspace.manageProjects' }));

      expect(navigateMock).toHaveBeenCalledWith('/workspace/organizations#projects');
    });

    it('does not render metrics when no organization is selected', async () => {
      await renderDashboardHomeScreen();

      expect(
        screen.queryByRole('region', { name: 'dashboard.stats.title' }),
      ).not.toBeInTheDocument();
    });

    it('renders the games section', async () => {
      await renderDashboardHomeScreen();

      expect(screen.getByRole('heading', { name: 'dashboard.games.title' })).toBeInTheDocument();
    });

    it('renders the active party section above the games section', async () => {
      await renderDashboardHomeScreen();

      const headings = screen.getAllByRole('heading', { level: 2 });

      expect(headings.map((heading) => heading.textContent)).toContain(
        'dashboard.activeParty.title',
      );
      expect(
        headings.findIndex((heading) => heading.textContent === 'dashboard.activeParty.title'),
      ).toBeLessThan(
        headings.findIndex((heading) => heading.textContent === 'dashboard.games.title'),
      );
    });

    it('restores the persisted workspace selection and shows metrics', async () => {
      workspaceSelectionPortMockFactory.create(undefined, {
        organizationId: organizationIdentifier.parse(2),
        projectId: projectIdentifier.parse(8),
      });

      renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={createDefaultDashboardHomeActions()}
          gameTypes={[]}
          dashboardWorkspace={createDefaultDashboardWorkspace({
            loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
              organizationDashboard: dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
                stats: {
                  totalGames: 3,
                  totalMembers: 5,
                  totalProjects: 1,
                },
              }),
              projects: [dashboardHomeScreenFixtureFactory.createProject()],
              projectId: projectIdentifier.parse(8),
            }),
          })}
          resolvePartyRoute={resolvePartyRoute}
        />,
      );

      expect(
        await screen.findByRole('region', { name: 'dashboard.stats.title' }),
      ).toBeInTheDocument();
    });

    it('renders metrics when organization dashboard is loaded', async () => {
      renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={createDefaultDashboardHomeActions()}
          gameTypes={[]}
          dashboardWorkspace={createDefaultDashboardWorkspace({
            loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
              organizationDashboard: dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
                stats: {
                  totalGames: 3,
                  totalMembers: 5,
                  totalProjects: 1,
                },
              }),
              projects: [dashboardHomeScreenFixtureFactory.createProject()],
              projectId: projectIdentifier.parse(8),
            }),
          })}
          resolvePartyRoute={resolvePartyRoute}
        />,
      );

      expect(await screen.findByText('3')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders project-scoped game summaries after the project loads', async () => {
      const loadProjectGameCatalog = vi.fn().mockResolvedValue(
        dashboardHomeScreenFixtureFactory.createDashboardGamesPage({
          items: [
            gameFixtureFactory.createDashboardGame({
              gameId: 18,
              type: 'quiz',
              title: 'Project quiz',
              description: null,
              createdAt: '2026-03-12T00:00:00.000Z',
              gameTypeId: gameTypeIdentifier.parse(8),
              stageCount: 6,
              permissions: {
                createParty: {
                  allowed: true,
                  reason: null,
                },
              },
              summary: {
                translationKey: 'game.types.quiz.management.questionSummary',
                values: {
                  count: '6',
                },
              },
            }),
          ],
          totalCount: 1,
          overallCount: 1,
        }),
      );

      renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={createDefaultDashboardHomeActions()}
          gameTypes={[createGameTypeDescriptorFixture({ key: 'quiz' })]}
          dashboardWorkspace={createDefaultDashboardWorkspace({
            loadProjectGameCatalog,
            loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
              organizationDashboard: dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
                stats: {
                  totalGames: 3,
                  totalMembers: 5,
                  totalProjects: 1,
                },
              }),
              projects: [dashboardHomeScreenFixtureFactory.createProject()],
              projectId: projectIdentifier.parse(8),
            }),
          })}
          resolvePartyRoute={resolvePartyRoute}
        />,
      );

      expect(await screen.findByText('Project quiz')).toBeInTheDocument();
      expect(
        screen.getByText('game.types.quiz.management.questionSummary (count=6)'),
      ).toBeInTheDocument();
    });

    it('renders project-scoped parties after the project loads', async () => {
      const loadUserParties = vi.fn().mockResolvedValue([
        partyFixtureFactory.createParty({
          partyId: 44,
          gameId: 18,
          pin: '123456',
          status: PartyStatus.WAITING,
        }),
      ]);

      renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={createDefaultDashboardHomeActions()}
          gameTypes={[createGameTypeDescriptorFixture({ key: 'quiz' })]}
          dashboardWorkspace={createDefaultDashboardWorkspace({
            loadUserParties,
            loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
              organizationDashboard: dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
                stats: {
                  totalGames: 3,
                  totalMembers: 5,
                  totalProjects: 1,
                },
              }),
              projects: [dashboardHomeScreenFixtureFactory.createProject()],
              projectId: projectIdentifier.parse(8),
            }),
          })}
          resolvePartyRoute={resolvePartyRoute}
        />,
      );

      expect(
        await screen.findByRole('heading', {
          name: 'dashboard.activeParty.pinTitle (pin=123456)',
        }),
      ).toBeInTheDocument();
      expect(loadUserParties).toHaveBeenCalledWith();
    });

    it('loads user parties even when no project is selected', async () => {
      const loadUserParties = vi.fn().mockResolvedValue([
        partyFixtureFactory.createParty({
          partyId: 44,
          gameId: 18,
          pin: '123456',
          status: PartyStatus.WAITING,
        }),
      ]);

      renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={createDefaultDashboardHomeActions()}
          gameTypes={[]}
          dashboardWorkspace={createDefaultDashboardWorkspace({
            loadUserParties,
            loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
              organizationDashboard: null,
              projects: [],
              projectId: null,
            }),
          })}
          resolvePartyRoute={resolvePartyRoute}
        />,
      );

      expect(
        await screen.findByRole('heading', {
          name: 'dashboard.activeParty.pinTitle (pin=123456)',
        }),
      ).toBeInTheDocument();
      expect(loadUserParties).toHaveBeenCalledWith();
      expect(screen.getByText('dashboard.games.pending')).toBeInTheDocument();
    });

    it('navigates quiz management with the quiz id instead of the game id', async () => {
      const user = userEvent.setup();
      const dashboardHomeActions = dashboardHomeActionsFacadeMockFactory.create({
        resolveManageGameRoute: vi.fn((game) => `/quizzes/${game.gameTypeId}`),
      });
      const loadProjectGameCatalog = vi.fn().mockResolvedValue(
        dashboardHomeScreenFixtureFactory.createDashboardGamesPage({
          items: [
            gameFixtureFactory.createDashboardGame({
              gameId: 13,
              type: 'quiz',
              title: 'Project quiz',
              description: null,
              createdAt: '2026-03-12T00:00:00.000Z',
              gameTypeId: gameTypeIdentifier.parse(12),
              stageCount: 6,
              permissions: {
                createParty: {
                  allowed: true,
                  reason: null,
                },
              },
            }),
          ],
          totalCount: 1,
          overallCount: 1,
        }),
      );

      renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={dashboardHomeActions}
          gameTypes={[
            createGameTypeDescriptorFixture({
              key: 'quiz',
              managementRoutePath: '/quizzes',
            }),
          ]}
          dashboardWorkspace={createDefaultDashboardWorkspace({
            loadProjectGameCatalog,
            loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
              organizationDashboard: dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
                stats: {
                  totalGames: 1,
                  totalMembers: 5,
                  totalProjects: 1,
                },
              }),
              projects: [dashboardHomeScreenFixtureFactory.createProject()],
              projectId: projectIdentifier.parse(8),
            }),
          })}
          resolvePartyRoute={resolvePartyRoute}
        />,
      );

      await screen.findByText('Project quiz');

      await user.click(screen.getByRole('button', { name: 'dashboard.games.actions.manage' }));

      expect(navigateMock).toHaveBeenCalledWith('/quizzes/12');
    });

    it('creates a party directly from a dashboard game card and surfaces it in the parties section', async () => {
      const user = userEvent.setup();
      const createParty = vi.fn().mockResolvedValue(
        partyFixtureFactory.createParty({
          partyId: 98,
          gameId: 13,
          pin: '654321',
          status: PartyStatus.WAITING,
        }),
      );
      const loadProjectGameCatalog = vi.fn().mockResolvedValue(
        dashboardHomeScreenFixtureFactory.createDashboardGamesPage({
          items: [
            gameFixtureFactory.createDashboardGame({
              gameId: 13,
              type: 'quiz',
              title: 'Project quiz',
              description: null,
              createdAt: '2026-03-12T00:00:00.000Z',
              gameTypeId: gameTypeIdentifier.parse(12),
              stageCount: 6,
              permissions: {
                createParty: {
                  allowed: true,
                  reason: null,
                },
              },
            }),
          ],
          totalCount: 1,
          overallCount: 1,
        }),
      );

      renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={createDefaultDashboardHomeActions()}
          gameTypes={[
            createGameTypeDescriptorFixture({
              key: 'quiz',
              managementRoutePath: '/quizzes',
            }),
          ]}
          dashboardWorkspace={createDefaultDashboardWorkspace({
            createParty,
            loadProjectGameCatalog,
            loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
              organizationDashboard: dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
                stats: {
                  totalGames: 1,
                  totalMembers: 5,
                  totalProjects: 1,
                },
              }),
              projects: [dashboardHomeScreenFixtureFactory.createProject()],
              projectId: projectIdentifier.parse(8),
            }),
          })}
          resolvePartyRoute={resolvePartyRoute}
        />,
      );

      await screen.findByText('Project quiz');

      await user.click(screen.getByRole('button', { name: 'dashboard.games.actions.createParty' }));

      expect(createParty).toHaveBeenCalledWith(gameIdentifier.parse(13));
      expect(navigateMock).toHaveBeenCalledWith('/party/98/lobby');
      expect(
        await screen.findByRole('heading', {
          name: 'dashboard.activeParty.pinTitle (pin=654321)',
        }),
      ).toBeInTheDocument();
    });

    it('creates a game from the dashboard dialog and navigates to its management route', async () => {
      const user = userEvent.setup();
      const dashboardHomeActions = dashboardHomeActionsFacadeMockFactory.create({
        createGame: vi.fn().mockResolvedValue('/quizzes/12'),
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
          dashboardWorkspace={createDefaultDashboardWorkspace({
            loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
              organizationDashboard: dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
                stats: {
                  totalGames: 1,
                  totalMembers: 5,
                  totalProjects: 1,
                },
              }),
              projects: [dashboardHomeScreenFixtureFactory.createProject()],
              projectId: projectIdentifier.parse(8),
            }),
          })}
          resolvePartyRoute={resolvePartyRoute}
        />,
      );

      await user.click(
        await screen.findByRole('button', { name: 'dashboard.games.actions.createGame' }),
      );
      const dialog = await screen.findByRole('dialog');
      fireEvent.change(within(dialog).getAllByRole('textbox')[0], {
        target: { value: 'Project quiz' },
      });
      await user.click(screen.getByRole('button', { name: 'dashboard.games.create.submit' }));

      await waitFor(() => {
        expect(dashboardHomeActions.createGame).toHaveBeenCalledWith({
          description: null,
          projectId: projectIdentifier.parse(8),
          title: 'Project quiz',
          type: 'quiz',
        });
      });
      expect(navigateMock).toHaveBeenCalledWith('/quizzes/12');
    });

    it('disables create-party when the user already hosts a non-ended party for another game', async () => {
      const loadProjectGameCatalog = vi.fn().mockResolvedValue(
        dashboardHomeScreenFixtureFactory.createDashboardGamesPage({
          items: [
            gameFixtureFactory.createDashboardGame({
              gameId: 13,
              type: 'quiz',
              title: 'Project quiz',
              description: null,
              createdAt: '2026-03-12T00:00:00.000Z',
              gameTypeId: gameTypeIdentifier.parse(12),
              stageCount: 6,
              permissions: {
                createParty: {
                  allowed: false,
                  reason: CreatePartyDisabledReason.HOST_HAS_ACTIVE_PARTY,
                },
              },
            }),
          ],
          totalCount: 1,
          overallCount: 1,
        }),
      );

      renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={createDefaultDashboardHomeActions()}
          gameTypes={[
            createGameTypeDescriptorFixture({
              key: 'quiz',
              managementRoutePath: '/quizzes',
            }),
          ]}
          dashboardWorkspace={createDefaultDashboardWorkspace({
            loadProjectGameCatalog,
            loadUserParties: vi.fn().mockResolvedValue([
              partyFixtureFactory.createParty({
                partyId: 44,
                gameId: 99,
                pin: '123456',
                status: PartyStatus.WAITING,
              }),
            ]),
            loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
              organizationDashboard: dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
                stats: {
                  totalGames: 1,
                  totalMembers: 5,
                  totalProjects: 1,
                },
              }),
              projects: [dashboardHomeScreenFixtureFactory.createProject()],
              projectId: projectIdentifier.parse(8),
            }),
          })}
          resolvePartyRoute={resolvePartyRoute}
        />,
      );

      expect(await screen.findByText('Project quiz', {}, { timeout: 5000 })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'dashboard.games.actions.createParty' }),
      ).toBeDisabled();
    });

    it('disables create-party from backend-provided catalog permissions', async () => {
      const loadProjectGameCatalog = vi.fn().mockResolvedValue(
        dashboardHomeScreenFixtureFactory.createDashboardGamesPage({
          items: [
            gameFixtureFactory.createDashboardGame({
              gameId: 13,
              type: 'quiz',
              title: 'Project quiz',
              description: null,
              createdAt: '2026-03-12T00:00:00.000Z',
              gameTypeId: gameTypeIdentifier.parse(12),
              stageCount: 6,
              permissions: {
                createParty: {
                  allowed: false,
                  reason: CreatePartyDisabledReason.HOST_HAS_ACTIVE_PARTY,
                },
              },
            }),
          ],
          totalCount: 1,
          overallCount: 1,
        }),
      );

      renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={createDefaultDashboardHomeActions()}
          gameTypes={[
            createGameTypeDescriptorFixture({
              key: 'quiz',
              managementRoutePath: '/quizzes',
            }),
          ]}
          dashboardWorkspace={createDefaultDashboardWorkspace({
            loadProjectGameCatalog,
            loadUserParties: vi.fn().mockResolvedValue([
              partyFixtureFactory.createParty({
                partyId: 44,
                gameId: 99,
                pin: '123456',
                status: PartyStatus.ACTIVE,
              }),
            ]),
            loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
              organizationDashboard: dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
                stats: {
                  totalGames: 1,
                  totalMembers: 5,
                  totalProjects: 1,
                },
              }),
              projects: [dashboardHomeScreenFixtureFactory.createProject()],
              projectId: projectIdentifier.parse(8),
            }),
          })}
          resolvePartyRoute={resolvePartyRoute}
        />,
      );

      expect(await screen.findByText('Project quiz')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'dashboard.games.actions.createParty' }),
      ).toBeDisabled();
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
        gameTypeId: GameTypeId | null;
        stageCount: number;
        permissions?: {
          createParty: {
            allowed: boolean;
            reason: CreatePartyDisabledReason | null;
          };
        };
        summary?: {
          translationKey: string;
          values?: Record<string, string>;
        };
      }>,
      gameTypes: readonly GameTypeDescriptor[] = [],
    ) {
      const loadProjectGameCatalog = vi.fn().mockImplementation((query) => {
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
        const items = filtered
          .slice(start, start + query.pageSize)
          .map((game) => gameFixtureFactory.createDashboardGame(game));

        return Promise.resolve({
          items,
          totalCount: filtered.length,
          overallCount: games.length,
          page: query.page,
          pageSize: query.pageSize,
          totalPages: Math.max(1, Math.ceil(filtered.length / query.pageSize)),
        });
      });

      const renderResult = renderWithProviders(
        <DashboardHomeScreen
          dashboardHomeActions={createDefaultDashboardHomeActions()}
          gameTypes={gameTypes}
          dashboardWorkspace={createDefaultDashboardWorkspace({
            loadProjectGameCatalog,
            loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
              organizationDashboard: dashboardHomeScreenFixtureFactory.createOrganizationDashboard({
                stats: {
                  totalGames: games.length,
                  totalMembers: 1,
                  totalProjects: 1,
                },
              }),
              projects: [dashboardHomeScreenFixtureFactory.createProject()],
              projectId: projectIdentifier.parse(8),
            }),
          })}
          resolvePartyRoute={resolvePartyRoute}
        />,
      );

      return { ...renderResult, loadProjectGameCatalog };
    }

    const twoGames = [
      {
        gameId: 10,
        type: 'quiz',
        title: 'Alpha quiz',
        description: null,
        createdAt: '2026-03-10T00:00:00.000Z',
        gameTypeId: gameTypeIdentifier.parse(1),
        stageCount: 0,
        permissions: {
          createParty: {
            allowed: true,
            reason: null,
          },
        },
      },
      {
        gameId: 11,
        type: 'prediction',
        title: 'Beta prediction',
        description: null,
        createdAt: '2026-03-12T00:00:00.000Z',
        gameTypeId: gameTypeIdentifier.parse(2),
        stageCount: 0,
        permissions: {
          createParty: {
            allowed: true,
            reason: null,
          },
        },
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

      const typeInput = screen.getByRole('combobox', {
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
      const { loadProjectGameCatalog } = renderWithGames(twoGames);

      await screen.findByText('Alpha quiz');

      fireEvent.change(screen.getByPlaceholderText('dashboard.games.filters.searchPlaceholder'), {
        target: { value: 'zzz-no-match' },
      });

      await waitFor(() => {
        expect(loadProjectGameCatalog).toHaveBeenLastCalledWith({
          projectId: projectIdentifier.parse(8),
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
});
