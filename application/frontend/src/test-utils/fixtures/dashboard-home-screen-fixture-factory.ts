import { vi } from 'vitest';
import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import type { DashboardGameListPage } from '../../domains/game/management/entities/dashboard-game-list-page';
import {
  type Organization,
  type OrganizationId,
} from '../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../domains/organization/entities/organization-dashboard';
import type { Project, ProjectId } from '../../domains/project/entities/project';
import { OrganizationFixtureFactory } from './organization-fixture-factory';
import { ProjectFixtureFactory } from './project-fixture-factory';

const DEFAULT_TIMESTAMP = '2026-03-12T00:00:00.000Z';
const organizationIdentifier = new OrganizationIdentifier();

interface OrganizationOverrides extends Omit<Partial<Organization>, 'id'> {
  readonly id?: OrganizationId;
}

interface ProjectOverrides extends Omit<Partial<Project>, 'id' | 'organizationId'> {
  readonly id?: ProjectId;
  readonly organizationId?: OrganizationId;
}

type DashboardProjectGamesGateway = {
  loadProjectGameCatalog(
    query: import('../../domains/game/management/entities/dashboard-game-list-query').DashboardGameListQuery,
  ): Promise<DashboardGameListPage>;
};

export class DashboardHomeScreenFixtureFactory {
  constructor(
    private readonly organizationFixtureFactory = new OrganizationFixtureFactory(),
    private readonly projectFixtureFactory = new ProjectFixtureFactory(),
  ) {}

  createOrganization(overrides: OrganizationOverrides = {}): Organization {
    return this.organizationFixtureFactory.createOrganization({
      id: overrides.id,
      name: 'Org 2',
      description: null,
      createdAt: DEFAULT_TIMESTAMP,
      updatedAt: DEFAULT_TIMESTAMP,
      ...overrides,
    });
  }

  createProject(overrides: ProjectOverrides = {}): Project {
    return this.projectFixtureFactory.createProject({
      id: overrides.id ?? 8,
      name: 'Project 8',
      description: null,
      organizationId: overrides.organizationId ?? 2,
      createdAt: DEFAULT_TIMESTAMP,
      ...overrides,
    });
  }

  createOrganizationDashboard(
    overrides: Partial<OrganizationDashboard> = {},
  ): OrganizationDashboard {
    return this.organizationFixtureFactory.createOrganizationDashboard({
      organization: {
        id: organizationIdentifier.parse('00000000-0000-7000-8000-000000000002'),
        name: 'Org 2',
        description: null,
        ...overrides.organization,
      },
      stats: overrides.stats,
    });
  }

  createDashboardGamesPage(overrides: Partial<DashboardGameListPage> = {}): DashboardGameListPage {
    return {
      items: [],
      totalCount: 0,
      overallCount: 0,
      page: 1,
      pageSize: 9,
      totalPages: 1,
      ...overrides,
    };
  }

  createProjectGamesGateway(
    overrides: Partial<DashboardProjectGamesGateway> = {},
  ): DashboardProjectGamesGateway {
    return {
      loadProjectGameCatalog: vi.fn().mockResolvedValue(this.createDashboardGamesPage()),
      ...overrides,
    };
  }
}
