import { describe, expect, it, vi } from 'vitest';
import { DashboardHomeScreenFixtureFactory } from '../../../../test-utils/fixtures/dashboard-home-screen-fixture-factory';
import { WorkspaceSelectionPortMockFactory } from '../../../../test-utils/mocks/workspace-selection-port-mock-factory';
import { PartyIdentifier } from '../../../game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../../game/party/shared/services/identifiers/party-pin-identifier';
import { GameIdentifier } from '../../../game/shared/services/identifiers/game-identifier';
import { OrganizationIdentifier } from '../../shared/services/identifiers/organization-identifier';
import { ProjectIdentifier } from '../../shared/services/identifiers/project-identifier';
import { DashboardWorkspaceFacade } from './dashboard-workspace.facade';

const partyIdentifier = new PartyIdentifier();
const partyPinIdentifier = new PartyPinIdentifier();
const gameIdentifier = new GameIdentifier();
const organizationIdentifier = new OrganizationIdentifier();
const projectIdentifier = new ProjectIdentifier();

function createPaginatedResult<TItem>(items: readonly TItem[]) {
  return {
    items,
    totalCount: items.length,
    overallCount: items.length,
    page: 1,
    pageSize: 25,
    totalPages: 1,
  };
}

describe('DashboardWorkspaceFacade', () => {
  const dashboardHomeScreenFixtureFactory = new DashboardHomeScreenFixtureFactory();
  const workspaceSelectionPortMockFactory = new WorkspaceSelectionPortMockFactory();

  it('delegates project game loading to the use case', async () => {
    const listProjectGamesUseCase = {
      execute: vi
        .fn()
        .mockResolvedValue(dashboardHomeScreenFixtureFactory.createDashboardGamesPage()),
    };
    const facade = new DashboardWorkspaceFacade(
      listProjectGamesUseCase as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      workspaceSelectionPortMockFactory.create(),
    );

    await facade.loadProjectGameCatalog({
      projectId: projectIdentifier.parse(8),
      search: '',
      typeFilter: [],
      sortField: 'createdAt',
      sortDirection: 'desc',
      page: 1,
      pageSize: 9,
    });

    expect(listProjectGamesUseCase.execute).toHaveBeenCalledWith({
      projectId: projectIdentifier.parse(8),
      search: '',
      typeFilter: [],
      sortField: 'createdAt',
      sortDirection: 'desc',
      page: 1,
      pageSize: 9,
    });
  });

  it('delegates user party loading to the use case', async () => {
    const listPartiesUseCase = {
      execute: vi.fn().mockResolvedValue([]),
    };
    const facade = new DashboardWorkspaceFacade(
      { execute: vi.fn() } as never,
      listPartiesUseCase as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      workspaceSelectionPortMockFactory.create(),
    );

    await facade.loadUserParties();

    expect(listPartiesUseCase.execute).toHaveBeenCalledWith();
  });

  it('delegates party creation to the use case', async () => {
    const createPartyUseCase = {
      execute: vi.fn().mockResolvedValue({
        partyId: partyIdentifier.parse(44),
        gameId: gameIdentifier.parse(18),
        pin: partyPinIdentifier.parse('123456'),
        status: 'WAITING',
        role: 'HOST',
        createdAt: '2026-03-12T00:00:00.000Z',
      }),
    };
    const facade = new DashboardWorkspaceFacade(
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      createPartyUseCase as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      workspaceSelectionPortMockFactory.create(),
    );

    await facade.createParty(gameIdentifier.parse(18));

    expect(createPartyUseCase.execute).toHaveBeenCalledWith({
      gameId: gameIdentifier.parse(18),
    });
  });

  it('restores the persisted organization when it is still available', async () => {
    const organization = dashboardHomeScreenFixtureFactory.createOrganization({
      id: organizationIdentifier.parse(7),
    });
    const listMyOrganizationsUseCase = {
      execute: vi.fn().mockResolvedValue(createPaginatedResult([organization])),
    };
    const workspaceSelection = workspaceSelectionPortMockFactory.create(undefined, {
      organizationId: organizationIdentifier.parse(7),
      projectId: null,
    });
    const facade = new DashboardWorkspaceFacade(
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      listMyOrganizationsUseCase as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      workspaceSelection,
    );

    await expect(facade.restoreOrganizationSelection()).resolves.toEqual({
      organizationsPage: createPaginatedResult([organization]),
      organizationId: organizationIdentifier.parse(7),
    });
    expect(workspaceSelection.setOrganizationId).toHaveBeenCalledWith(
      organizationIdentifier.parse(7),
    );
  });

  it('falls back to the first organization when the persisted one is missing', async () => {
    const firstOrganization = dashboardHomeScreenFixtureFactory.createOrganization({
      id: organizationIdentifier.parse(3),
    });
    const secondOrganization = dashboardHomeScreenFixtureFactory.createOrganization({
      id: organizationIdentifier.parse(7),
    });
    const listMyOrganizationsUseCase = {
      execute: vi
        .fn()
        .mockResolvedValue(createPaginatedResult([firstOrganization, secondOrganization])),
    };
    const workspaceSelection = workspaceSelectionPortMockFactory.create(undefined, {
      organizationId: organizationIdentifier.parse(99),
      projectId: projectIdentifier.parse(11),
    });
    const facade = new DashboardWorkspaceFacade(
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      listMyOrganizationsUseCase as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      workspaceSelection,
    );

    await expect(facade.restoreOrganizationSelection()).resolves.toEqual({
      organizationsPage: createPaginatedResult([firstOrganization, secondOrganization]),
      organizationId: organizationIdentifier.parse(3),
    });
    expect(workspaceSelection.setOrganizationId).toHaveBeenCalledWith(
      organizationIdentifier.parse(3),
    );
  });

  it('restores the persisted project for the selected organization', async () => {
    const organizationDashboard = dashboardHomeScreenFixtureFactory.createOrganizationDashboard();
    const firstProject = dashboardHomeScreenFixtureFactory.createProject({
      id: projectIdentifier.parse(8),
    });
    const secondProject = dashboardHomeScreenFixtureFactory.createProject({
      id: projectIdentifier.parse(13),
    });
    const getOrganizationDashboardUseCase = {
      execute: vi.fn().mockResolvedValue(organizationDashboard),
    };
    const listOrganizationProjectsUseCase = {
      execute: vi.fn().mockResolvedValue(createPaginatedResult([firstProject, secondProject])),
    };
    const workspaceSelection = workspaceSelectionPortMockFactory.create(undefined, {
      organizationId: organizationIdentifier.parse(2),
      projectId: projectIdentifier.parse(13),
    });
    const facade = new DashboardWorkspaceFacade(
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      getOrganizationDashboardUseCase as never,
      listOrganizationProjectsUseCase as never,
      workspaceSelection,
    );

    await expect(
      facade.loadOrganizationWorkspaceState({ organizationId: organizationIdentifier.parse(2) }),
    ).resolves.toEqual({
      organizationDashboard,
      projectsPage: createPaginatedResult([firstProject, secondProject]),
      projectId: projectIdentifier.parse(13),
    });
    expect(workspaceSelection.setProjectId).toHaveBeenCalledWith(projectIdentifier.parse(13));
  });

  it('clears the project selection when no organization is selected', async () => {
    const workspaceSelection = workspaceSelectionPortMockFactory.create();
    const facade = new DashboardWorkspaceFacade(
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      workspaceSelection,
    );

    await expect(facade.loadOrganizationWorkspaceState({ organizationId: null })).resolves.toEqual({
      organizationDashboard: null,
      projectsPage: {
        items: [],
        totalCount: 0,
        overallCount: 0,
        page: 1,
        pageSize: 25,
        totalPages: 1,
      },
      projectId: null,
    });
    expect(workspaceSelection.setProjectId).toHaveBeenCalledWith(null);
  });
});
