import { vi } from 'vitest';
import type { DashboardReadGateway } from '../../application/workspace/dashboard/gateways/dashboard-read.gateway';
import type { DashboardGameListPage } from '../../domains/game-catalog/entities/dashboard-game-list-page';
import type { DashboardActiveSessionItem } from '../../domains/game-session/entities/active-game-session';
import {
  type Organization,
  OrganizationRole,
} from '../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../domains/organization/entities/organization-dashboard';
import type { Project } from '../../domains/project/entities/project';
import { createDashboardActiveSessionFixture } from './dashboard-active-session-fixture-factory';
import { DashboardReadGatewayMockFactory } from './dashboard-read-gateway-mock-factory';

const DEFAULT_TIMESTAMP = '2026-03-12T00:00:00.000Z';

export class DashboardHomeScreenFixtureFactory {
  constructor(
    private readonly dashboardReadGatewayMockFactory = new DashboardReadGatewayMockFactory(),
  ) {}

  createOrganization(overrides: Partial<Organization> = {}): Organization {
    return {
      id: 2,
      name: 'Org 2',
      description: null,
      createdAt: DEFAULT_TIMESTAMP,
      updatedAt: DEFAULT_TIMESTAMP,
      role: OrganizationRole.OWNER,
      ...overrides,
    };
  }

  createProject(overrides: Partial<Project> = {}): Project {
    return {
      id: 8,
      name: 'Project 8',
      description: null,
      organizationId: 2,
      createdAt: DEFAULT_TIMESTAMP,
      ...overrides,
    };
  }

  createOrganizationDashboard(
    overrides: Partial<OrganizationDashboard> = {},
  ): OrganizationDashboard {
    return {
      organization: {
        id: 2,
        name: 'Org 2',
        description: null,
        ...overrides.organization,
      },
      stats: {
        totalGames: 0,
        totalGameSessions: 0,
        activeGameSessions: 0,
        totalMembers: 0,
        totalProjects: 0,
        ...overrides.stats,
      },
    };
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

  createActiveSession(
    overrides: Partial<DashboardActiveSessionItem> = {},
  ): DashboardActiveSessionItem {
    return createDashboardActiveSessionFixture(overrides);
  }

  createDashboardReadGateway(overrides: Partial<DashboardReadGateway> = {}): DashboardReadGateway {
    return this.dashboardReadGatewayMockFactory.create({
      loadOrganizations: vi.fn().mockResolvedValue([this.createOrganization()]),
      loadOrganizationDashboard: vi.fn().mockResolvedValue(this.createOrganizationDashboard()),
      loadProjectsByOrganization: vi.fn().mockResolvedValue([this.createProject()]),
      loadProjectDashboardGames: vi.fn().mockResolvedValue(this.createDashboardGamesPage()),
      ...overrides,
    });
  }
}
