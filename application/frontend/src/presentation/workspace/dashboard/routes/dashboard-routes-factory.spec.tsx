import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetGameTypeSequence } from '../../../../test-utils/fixtures/game-type-descriptor-fixture-factory';
import { DashboardHomeActionsFacadeMockFactory } from '../../../../test-utils/mocks/dashboard-home-actions-facade-mock-factory';
import { DashboardWorkspaceGatewayMockFactory } from '../../../../test-utils/mocks/dashboard-workspace-gateway-mock-factory';
import { GameTypeCatalogGatewayMockFactory } from '../../../../test-utils/mocks/game-type-catalog-gateway-mock-factory';
import { DashboardRoutesFactory } from './dashboard-routes-factory';

const partyRouteService = {
  resolvePartyRoute: () => '/party/44/lobby',
};

describe('DashboardRoutesFactory', () => {
  const dashboardHomeActionsFacadeMockFactory = new DashboardHomeActionsFacadeMockFactory();
  const dashboardWorkspaceGatewayMockFactory = new DashboardWorkspaceGatewayMockFactory();
  const gameTypeCatalogGatewayMockFactory = new GameTypeCatalogGatewayMockFactory();

  beforeEach(() => {
    resetGameTypeSequence();
  });

  describe('create()', () => {
    it('includes the dashboard index route', () => {
      // Arrange
      const gateway = gameTypeCatalogGatewayMockFactory.create({ descriptors: [] });
      const dashboardHomeActions = dashboardHomeActionsFacadeMockFactory.create();
      const dashboardWorkspace = dashboardWorkspaceGatewayMockFactory.create();

      // Act
      const routes = new DashboardRoutesFactory(
        gateway,
        dashboardHomeActions,
        dashboardWorkspace,
        partyRouteService as never,
      ).create();

      // Assert
      expect(routes.some((r) => r.path === 'workspace/dashboard')).toBe(true);
    });

    it('returns only the dashboard route regardless of game types', () => {
      // Arrange
      const gateway = gameTypeCatalogGatewayMockFactory.create();
      const dashboardHomeActions = dashboardHomeActionsFacadeMockFactory.create();
      const dashboardWorkspace = dashboardWorkspaceGatewayMockFactory.create();

      // Act
      const routes = new DashboardRoutesFactory(
        gateway,
        dashboardHomeActions,
        dashboardWorkspace,
        partyRouteService as never,
      ).create();

      // Assert
      expect(routes).toHaveLength(1);
    });
  });
});
