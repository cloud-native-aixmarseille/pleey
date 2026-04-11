import { vi } from 'vitest';
import type { GameTypeRegistry } from '../../application/game/types/shared/services/game-type-registry';
import type { DashboardGameListItem } from '../../domains/game/management/entities/dashboard-game-list-item';
import type { GameType } from '../../domains/game/types/shared/game-type';

interface GameTypeRegistryMock {
  enrichGames(items: readonly DashboardGameListItem[]): DashboardGameListItem[];
  resolveManagementRoute(game: Pick<DashboardGameListItem, 'type' | 'gameTypeId'>): string | null;
  listTypes(): readonly GameType[];
}

export class GameTypeRegistryMockFactory {
  create(overrides: Partial<GameTypeRegistryMock> = {}): GameTypeRegistry {
    return {
      enrichGames: vi.fn((items: readonly DashboardGameListItem[]) => [...items]),
      resolveManagementRoute: vi.fn().mockReturnValue(null),
      listTypes: vi.fn().mockReturnValue([]),
      ...overrides,
    } as unknown as GameTypeRegistry;
  }
}
