import { vi } from 'vitest';
import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import type { DashboardGameListPage } from '../../domains/game/management/entities/dashboard-game-list-page';
import type {
  Organization,
  OrganizationId,
} from '../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../domains/organization/entities/organization-dashboard';
import type { Project } from '../../domains/project/entities/project';

const organizationIdentifier = new OrganizationIdentifier();

interface DashboardReadGatewayMock {
  loadOrganizations(): Promise<Organization[]>;
  loadOrganizationDashboard(organizationId: OrganizationId): Promise<OrganizationDashboard>;
  loadProjectsByOrganization(organizationId: OrganizationId): Promise<Project[]>;
  loadProjectGames(query: unknown): Promise<DashboardGameListPage>;
}

export class DashboardReadGatewayMockFactory {
  create(overrides: Partial<DashboardReadGatewayMock> = {}): DashboardReadGatewayMock {
    return {
      loadOrganizations: vi.fn().mockResolvedValue([]),
      loadOrganizationDashboard: vi.fn().mockResolvedValue({
        organization: {
          id: organizationIdentifier.parse(1),
          name: 'Org',
          description: null,
        },
        stats: {
          totalGames: 0,
          totalMembers: 0,
          totalProjects: 0,
        },
      }),
      loadProjectsByOrganization: vi.fn().mockResolvedValue([]),
      loadProjectGames: vi.fn().mockResolvedValue({
        items: [],
        totalCount: 0,
        overallCount: 0,
        page: 1,
        pageSize: 9,
        totalPages: 1,
      }),
      ...overrides,
    };
  }
}
