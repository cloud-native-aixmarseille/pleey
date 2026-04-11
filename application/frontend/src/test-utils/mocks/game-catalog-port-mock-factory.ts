import { vi } from 'vitest';
import type { GameCatalogPort } from '../../application/game/management/ports/game-catalog.port';
import { DashboardHomeScreenFixtureFactory } from '../fixtures/dashboard-home-screen-fixture-factory';

export class GameCatalogPortMockFactory {
  constructor(
    private readonly dashboardHomeScreenFixtureFactory = new DashboardHomeScreenFixtureFactory(),
  ) {}

  create(overrides: Partial<GameCatalogPort> = {}): GameCatalogPort {
    return {
      listProjectGames: vi
        .fn()
        .mockResolvedValue(this.dashboardHomeScreenFixtureFactory.createDashboardGamesPage()),
      ...overrides,
    };
  }
}
