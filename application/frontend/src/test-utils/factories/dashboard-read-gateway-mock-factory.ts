import { vi } from 'vitest';
import type { DashboardReadGateway } from '../../application/workspace/dashboard/gateways/dashboard-read.gateway';

export class DashboardReadGatewayMockFactory {
  create(overrides: Partial<DashboardReadGateway> = {}): DashboardReadGateway {
    return {
      createGameSession: vi.fn(),
      loadActiveSessions: vi.fn().mockResolvedValue([]),
      leaveCurrentPlayerSession: vi.fn().mockResolvedValue(true),
      loadOrganizations: vi.fn().mockResolvedValue([]),
      loadOrganizationDashboard: vi.fn().mockResolvedValue({
        organization: { id: 1, name: 'Org', description: null },
        stats: {
          totalGames: 0,
          totalGameSessions: 0,
          activeGameSessions: 0,
          totalMembers: 0,
          totalProjects: 0,
        },
      }),
      loadProjectsByOrganization: vi.fn().mockResolvedValue([]),
      loadProjectDashboardGames: vi.fn().mockResolvedValue({
        items: [],
        totalCount: 0,
        overallCount: 0,
        page: 1,
        pageSize: 9,
        totalPages: 1,
      }),
      loadProjectGames: vi.fn().mockResolvedValue([]),
      resumeGameSession: vi.fn(),
      stopGameSession: vi.fn(),
      ...overrides,
    };
  }
}
