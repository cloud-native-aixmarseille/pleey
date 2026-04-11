import { vi } from 'vitest';
import type { DashboardHomeActionsFacade } from '../../application/workspace/dashboard/facades/dashboard-home-actions.facade';

export class DashboardHomeActionsFacadeMockFactory {
  create(overrides: Partial<DashboardHomeActionsFacade> = {}): DashboardHomeActionsFacade {
    return {
      createGame: vi.fn().mockResolvedValue(null),
      resolveManageGameRoute: vi.fn().mockReturnValue(null),
      resolveOrganizationsRoute: vi.fn().mockReturnValue('/workspace/organizations'),
      resolveProjectsRoute: vi.fn().mockReturnValue('/workspace/organizations#projects'),
      ...overrides,
    } as DashboardHomeActionsFacade;
  }
}
