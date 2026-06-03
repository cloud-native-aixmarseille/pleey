import { vi } from 'vitest';
import { PartyIdentifier } from '../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GameIdentifier } from '../../application/game/shared/services/identifiers/game-identifier';
import type { DashboardWorkspaceGateway } from '../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import { PartyRole } from '../../domains/game/party/shared/entities/party-role';
import { PartyStatus } from '../../domains/game/party/shared/entities/party-status';
import type { PaginatedResult } from '../../domains/shared/value-objects/paginated-result';
import { coerceUuidV7TestValue } from '../fixtures/uuid-v7-test-value';

const partyIdentifier = new PartyIdentifier();
const partyPinIdentifier = new PartyPinIdentifier();
const gameIdentifier = new GameIdentifier();

function createEmptyPage<TItem>(): PaginatedResult<TItem> {
  return {
    items: [],
    totalCount: 0,
    overallCount: 0,
    page: 1,
    pageSize: 25,
    totalPages: 1,
  };
}

export class DashboardWorkspaceGatewayMockFactory {
  create(overrides: Partial<DashboardWorkspaceGateway> = {}): DashboardWorkspaceGateway {
    return {
      loadProjectGameCatalog: vi.fn().mockResolvedValue({
        items: [],
        totalCount: 0,
        overallCount: 0,
        page: 1,
        pageSize: 9,
        totalPages: 1,
      }),
      createParty: vi.fn().mockResolvedValue({
        partyId: partyIdentifier.parse(coerceUuidV7TestValue(1)),
        gameId: gameIdentifier.parse(coerceUuidV7TestValue(1)),
        pin: partyPinIdentifier.parse('123456'),
        status: PartyStatus.WAITING,
        role: PartyRole.HOST,
        createdAt: '2026-03-12T00:00:00.000Z',
      }),
      loadUserParties: vi.fn().mockResolvedValue([]),
      loadOrganizationsPage: vi.fn().mockResolvedValue(createEmptyPage()),
      restoreOrganizationSelection: vi
        .fn()
        .mockResolvedValue({ organizationsPage: createEmptyPage(), organizationId: null }),
      loadOrganizationProjectsPage: vi.fn().mockResolvedValue(createEmptyPage()),
      loadOrganizationWorkspaceState: vi.fn().mockResolvedValue({
        organizationDashboard: null,
        projectsPage: createEmptyPage(),
        projectId: null,
      }),
      setOrganizationSelection: vi.fn(),
      setProjectSelection: vi.fn(),
      ...overrides,
    } as DashboardWorkspaceGateway;
  }
}
