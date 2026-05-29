import { vi } from 'vitest';
import type { DashboardHomeActionsFacade } from '../../application/workspace/dashboard/facades/dashboard-home-actions.facade';

export class DashboardHomeActionsFacadeMockFactory {
  create(overrides: Partial<DashboardHomeActionsFacade> = {}): DashboardHomeActionsFacade {
    return {
      createGame: vi.fn().mockResolvedValue(null),
      createGameFromImport: vi.fn().mockResolvedValue({
        importedCount: 0,
        route: null,
      }),
      getImportExampleProvider: vi.fn().mockReturnValue(null),
      resolveImportAcceptedFileTypes: vi
        .fn()
        .mockReturnValue(
          '.json,application/json,.csv,text/csv,.md,.markdown,text/markdown,.txt,text/plain',
        ),
      resolveManageGameRoute: vi.fn().mockReturnValue(null),
      resolveOrganizationsRoute: vi.fn().mockReturnValue('/workspace/organizations'),
      resolveProjectsRoute: vi.fn().mockReturnValue('/workspace/organizations#projects'),
      ...overrides,
    } as DashboardHomeActionsFacade;
  }
}
